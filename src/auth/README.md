# 🔐 Auth & Security Module

Este módulo implementa la capa de seguridad, autenticación y auditoría del sistema `nestjs_graphql`.

## 📋 Descripción General

El módulo de Autenticación (`AuthModule`) está diseñado para operar en un entorno de **Single Sign-On (SSO)**. No gestiona contraseñas de usuarios principales directamente (aunque soporta login local para desarrollo), sino que valida la identidad proporcionada por un proveedor de identidad externo mediante **JWT (JSON Web Tokens)** y correlaciona esa identidad con usuarios en la base de datos local.

### Características Principales
- **Validación JWT Stateless**: Verificación de firma y expiración de tokens emitidos por el SSO.
- **Autorización Híbrida**: La identidad viene del SSO, pero los permisos y roles se validan contra la base de datos local (`UsersModule`).
- **Auditoría Transaccional**: Registro inmutable de todos los accesos mediante `AuditInterceptor` y la entidad `AccessLog`.
- **Soporte Legacy/Dev**: Login local disponible para entornos de prueba o cuentas de servicio.

---

## 🏗️ Arquitectura de Seguridad

### Flujo de Autenticación (SSO)

1. **Cliente**: Obtiene un token JWT autenticándose directamente contra el proveedor SSO.
2. **Petición**: El cliente envía el token en el header `Authorization: Bearer <token>` a `nestjs_graphql`.
3. **Guard (`JwtAuthGuard`)**: Intercepta la petición.
4. **Estrategia (`SsoJwtStrategy`)**:
   - Valida la firma del token usando `SSO_JWT_SECRET`.
   - Extrae el `username` del payload.
   - Busca el usuario en la base de datos local (`UsersService`).
   - **Verificación**: Confirma que el usuario local exista y tenga `status: 1` (Activo).
5. **Contexto**: Si todo es válido, inyecta el objeto `User` en `request.user`.

### Auditoría

Cada petición procesada (exitosa o fallida) es interceptada por el `AuditInterceptor`, que registra:
- `correlationId`: Para trazar la petición a través de microservicios.
- `userId`: Usuario autenticado.
- `metadata`: Tiempos de respuesta, errores, roles, y IP.
- `statusCode`: Resultado de la operación.

---

## 🧩 Componentes del Módulo

### 1. Strategies
- **`SsoJwtStrategy`**: Valida tokens externos. Es la estrategia por defecto.
  - **Configuración**: Lee `SSO_JWT_SECRET` y `SSO_ISSUER`.
  - **Lógica de Negocio**: Rechaza tokens válidos criptográficamente si el usuario no existe o está inactivo en la BD local.

### 2. Guards
- **`JwtAuthGuard`**: Protege rutas requiriendo un token válido. Soporta el decorador `@Public()` para excepciones.
- **`RolesGuard`**: Verifica si el usuario tiene los roles requeridos definidos con `@Roles()`.

### 3. Services
- **`AuthService`**: Utilidades para validación de tokens y lógica de login local.
- **`AuditService`**: Abstracción para la persistencia de logs (actualmente escribe en MySQL vía TypeORM).

### 4. Entities
- **`AccessLog`**: Entidad de auditoría.
  - Almacena metadatos en formato **JSON** (compatible con MySQL `json` type).
  - Incluye `correlationId` indexado para búsquedas rápidas.

---

## ⚙️ Configuración

Variables de entorno requeridas en `.env`:

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `SSO_JWT_SECRET` | Clave para verificar firma de tokens SSO | *Requerido* |
| `SSO_ISSUER` | Emisor esperado del token (claim `iss`) | `external-sso` |
| `JWT_EXPIRATION` | Tiempo de vida para tokens locales (segundos) | `3600` |

---

## 🚀 Uso en Desarrollo

### Proteger una Ruta
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('cats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatsController {

  @Get()
  @Roles('ADMIN') // Solo usuarios con rol ADMIN
  findAll() {
    return 'This action returns all cats';
  }
}
```

### Ruta Pública
```typescript
import { Public } from 'src/auth/decorators/public.decorator';

@Post('login')
@Public() // Bypass JwtAuthGuard
login() { ... }
```

### Intercambio de Token SSO (SSO Sign-In)

Para integrar con aplicaciones frontend que ya se han autenticado con el proveedor SSO, se debe usar el endpoint `sso-sign-in`.

**Endpoint**: `POST /auth/sso-sign-in`

**Flujo:**
1. El frontend obtiene un token JWT del proveedor SSO externo.
2. Envía este token al backend.
3. El backend valida el token externo y verifica si el usuario existe localmente.
4. Retorna un **nuevo token de sesión local** firmado por esta aplicación.

**Ejemplo de Uso (cURL):**
```bash
curl -X POST http://localhost:3000/auth/sso-sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ..."
  }'
```

**Respuesta Exitosa (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJI...",
  "user": {
    "id": 1,
    "username": "jdoe",
    "role": "admin"
  }
}
```


---

## 📄 Notas

- ValidationPipe está configurado globalmente con whitelist: true. Esto hace que cualquier propiedad de un DTO que no tenga decoradores de validación sea eliminada (stripped) antes de llegar al controlador.
- INSERT INTO User (id, personId, username, password, role, status, createdAt, updatedAt) VALUES (1, 123456, 'fcachan@seguridadvial.gob.ar', 'hashed_placeholder', 'admin', 1, NOW(), NOW());