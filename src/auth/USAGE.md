# Auth Module - Guía de Uso

## 📋 Resumen

El módulo Auth implementa un **Auth & Access Audit Proxy (AAAP)** que centraliza:
- ✅ Autenticación LDAP corporativa
- ✅ Emisión de tokens JWT
- ✅ Auditoría automática de todas las peticiones
- ✅ Autorización basada en roles

## 🔐 Protegiendo Endpoints

### Opción 1: Endpoints Públicos (sin autenticación)

Usa el decorador `@Public()` para endpoints que no requieren autenticación:

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from '@/sigesta-auth';

@Controller('health')
export class HealthController {
  
  @Public()
  @Get()
  check() {
    return { status: 'ok' };
  }
}
```

### Opción 2: Endpoints Protegidos con JWT

Usa el guard `JwtAuthGuard` para proteger endpoints que requieren autenticación:

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '@/sigesta-auth';

@Controller('profile')
@UseGuards(JwtAuthGuard)  // Aplica a todas las rutas del controlador
export class ProfileController {
  
  @Get()
  getProfile(@Request() req) {
    // req.user contiene: { userId, email, iss }
    return {
      user: req.user,
      message: 'Perfil del usuario autenticado'
    };
  }
}
```

### Opción 3: Endpoints con Roles Específicos

Combina `JwtAuthGuard` con `RolesGuard` para autorización granular:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from '@/sigesta-auth';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  
  @Roles('admin', 'superadmin')
  @Get('users')
  getAllUsers() {
    return { message: 'Solo admin puede ver esto' };
  }
}
```

## 🔄 Flujo de Autenticación

### 1. Login del Usuario

```bash
POST http://localhost:3200/auth/login
Content-Type: application/json

{
  "username": "jdoe",
  "password": "password123"
}
```

**Respuesta**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": "jdoe",
    "name": "John Doe",
    "email": "jdoe@example.com"
  }
}
```

### 2. Usar el Token en Peticiones

```bash
GET http://localhost:3200/persons
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Auditoría Automática

**Todas las peticiones** se registran automáticamente en la tabla `access_logs`:

```typescript
{
  correlationId: "550e8400-e29b-41d4-a716-446655440001",
  userId: "jdoe",
  appId: "SIGESTA_AUTH_PROXY",
  action: "GET",
  resource: "/persons",
  statusCode: 200,
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  metadata: {
    duration: "45ms",
    roles: ["user"],
    error: null
  },
  createdAt: "2026-01-09T01:00:00.000Z"
}
```

### Consultar Logs de Auditoría

```sql
-- Actividad reciente de un usuario
SELECT * FROM access_logs 
WHERE userId = 'jdoe' 
ORDER BY createdAt DESC 
LIMIT 100;

-- Trazar una petición específica
SELECT * FROM access_logs 
WHERE correlationId = '550e8400-e29b-41d4-a716-446655440001' 
ORDER BY createdAt ASC;

-- Peticiones fallidas
SELECT * FROM access_logs 
WHERE statusCode >= 400 
ORDER BY createdAt DESC;
```

## 🎯 Distributed Tracing

El interceptor de auditoría genera o extrae el `x-correlation-id` de los headers:

```typescript
// En tus servicios, accede al correlation ID
const correlationId = request.correlationId;

// O envíalo en peticiones entre microservicios
axios.get('http://otro-servicio/api', {
  headers: {
    'x-correlation-id': correlationId
  }
});
```

## 🛠️ Configuración Avanzada

### Aplicar JWT Guard Globalmente

Si quieres que **todos** los endpoints requieran autenticación por defecto:

```typescript
// app.module.ts
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@/sigesta-auth';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

Luego marca los endpoints públicos con `@Public()`.

### Deshabilitar Auditoría en Endpoints Específicos

Actualmente el `AuditInterceptor` está configurado globalmente. Para excluir endpoints específicos, puedes crear un decorador `@SkipAudit()` similar a `@Public()`.

## 🔒 Seguridad en Producción

### Recomendaciones:

1. **Variables de Entorno**:
```env
JWT_SECRET=<clave-segura-256-bits>
JWT_EXPIRATION=28800  # 8 horas en segundos
LDAP_URL=ldaps://ldap.empresa.com:636  # Usar LDAPS
```

2. **Algoritmo RS256** (firma asimétrica):
   - Genera par de claves pública/privada
   - Expón llave pública en `/.well-known/jwks.json`
   - Los microservices validan localmente sin llamadas de red

3. **Blacklist de Tokens**:
   - Implementa Redis para tokens revocados
   - Valida en `JwtStrategy.validate()`

4. **Rate Limiting**:
```bash
pnpm add @nestjs/throttler
```

## 📚 Arquitectura

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ 1. POST /auth/login (user/pass)
       ▼
┌─────────────┐
│ LdapStrategy│◄──── Valida contra LDAP
└──────┬──────┘
       │ 2. Usuario validado
       ▼
┌─────────────┐
│ AuthService │──── Genera JWT firmado
└──────┬──────┘
       │ 3. Token JWT
       ▼
┌─────────────┐
│   Cliente   │──── Guarda token
└──────┬──────┘
       │ 4. GET /api/recurso
       │    Authorization: Bearer <token>
       ▼
┌─────────────┐
│JwtAuthGuard │──── Valida firma del token
└──────┬──────┘
       │ 5. Token válido
       ▼
┌─────────────┐
│ RolesGuard  │──── Verifica roles locales
└──────┬──────┘
       │ 6. Autorizado
       ▼
┌─────────────┐
│ Controller  │──── Ejecuta lógica
└──────┬──────┘
       │
       ▼
┌──────────────┐
│AuditIntercep.│──── Registra en access_logs
└──────────────┘
```

## 🧪 Testing

### Test del Login

```typescript
describe('AuthController', () => {
  it('should return JWT token on valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'jdoe', password: 'password123' })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body.user.uid).toBe('jdoe');
  });
});
```

### Test de Endpoints Protegidos

```typescript
it('should deny access without token', async () => {
  await request(app.getHttpServer())
    .get('/persons')
    .expect(401);
});

it('should allow access with valid token', async () => {
  const token = 'eyJhbGc...'; // Token válido
  
  await request(app.getHttpServer())
    .get('/persons')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
});
```

## 🆘 Troubleshooting

### Error: "Token inválido o expirado"
- Verifica que `JWT_SECRET` sea el mismo en emisión y validación
- Comprueba la fecha de expiración del token

### Error: "Invalid LDAP credentials"
- Verifica variables `LDAP_URL`, `LDAP_BIND_DN`, `LDAP_SEARCH_BASE`
- Testea conexión LDAP: `ldapsearch -x -H ldap://servidor:389 -b "dc=org,dc=com"`

### Los logs de auditoría no se guardan
- Verifica que la tabla `access_logs` exista
- Revisa logs del servidor para errores de base de datos
- Comprueba que `TypeOrmModule.forFeature([AccessLog])` esté registrado

---

**Última actualización**: 2026-01-09
