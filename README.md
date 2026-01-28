# App Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 📋 Descripción

Boilerplate para aplicaciones NestJS con GraphQL

**Versión**: 1.0.0  
**Estado**: En Desarrollo

---

### Stack Tecnológico

- **Framework**: NestJS 10.x
- **ORM**: TypeORM
- **Base de Datos**: MySQL
- **Lenguaje**: TypeScript (strict mode)
- **Documentación**: Swagger/OpenAPI
- **Validación**: class-validator, class-transformer
- **Autenticación**: SSO externo + JWT token validation
- **Seguridad**: Snyk (escaneo continuo)

## 🏗️ Arquitectura

### Módulos Incluidos

1. **AuthModule** - Gestión de autenticación y autorización
2. **UserModule** - Gestión de usuarios
3. **CommonModule** - Infraestructura global (filtros, interceptores, auditoría)

### Autenticación y Autorización

**Arquitectura SSO con Validación Local:**
- `nestjs_graphql`: Valida tokens JWT del SSO externo
- **SSO Externo**: Proveedor de autenticación (maneja login y emisión de tokens)
- **Tokens JWT** con información de usuario y roles
- **Validación local** contra base de datos para verificar usuarios activos
- **Auditoría inmutable** de todos los intentos de acceso

**Flujo de Autenticación:**
1. Usuario se autentica en el SSO externo
2. SSO emite un token JWT con información del usuario
3. Cliente envía el token en cada request (Authorization: Bearer <token>)
4. nestjs_graphql valida el token y verifica el usuario en BD local
5. Se otorga acceso basado en el rol del usuario en la BD local

Ver `src/auth/strategies/sso-jwt.strategy.ts` para detalles técnicos.

## 🎉 Implementaciones

- ✅ **Sistema de Auditoría**: `AuditLog` entity + `AuditService` integrado globalmente en `CommonModule`
- ✅ **Health Check**: Endpoint `/health` para monitoreo de producción
- ✅ **Documentación Swagger**: Todos los controladores documentados con `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- ✅ **CHANGELOG.md**: Documentación completa de la migración v1.x → v2.0.0
- ✅ **Escaneo de Seguridad**: 0 vulnerabilidades detectadas por Snyk

---

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+ 
- pnpm 8+
- MySQL 8+
- Graphql
- Docker (opcional)

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd nestjs_graphql

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos
```

### Configuración de Base de Datos

# Opción 1: Docker (recomendado para desarrollo)
pnpm run docker:deploy

# Opción 2: MySQL local
# Asegúrate de tener MySQL corriendo y crea la base de datos
createdb nestjs_graphql_dev

```bash
# Ejecutar seeders para poblar catálogos iniciales
pnpm run seed
```

### Ejecutar la Aplicación

```bash
# Modo desarrollo (con hot-reload)
pnpm run start:dev

# Modo producción
pnpm run build
pnpm run start:prod
```

La aplicación estará disponible en:
- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

---

## 📊 Estadísticas del Proyecto

- **66 archivos TypeScript/JSON** en `/src`
- **0 vulnerabilidades** de seguridad (Snyk)
- **100% de servicios core** migrados desde legacy
- **Seeders automáticos** con datos de prueba completos

---

## 🧪 Testing

```bash
# Tests unitarios
pnpm run test

# Tests e2e
pnpm run test:e2e

# Cobertura de código
pnpm run test:cov
```

---

## 📚 Documentación API

Una vez que la aplicación esté corriendo, visita:

**Swagger UI**: http://localhost:3000/api

Todos los endpoints están documentados con:
- Descripciones detalladas
- Ejemplos de request/response
- Esquemas de validación
- Códigos de estado HTTP

---

## 🔐 Seguridad

- **Validación estricta** de entrada en todos los endpoints
- **TypeScript strict mode** para prevención de errores en tiempo de compilación
- **Escaneo automático** con Snyk (integrado en el flujo de desarrollo)
- **Auditoría** de acciones críticas mediante `AuditService`

---

## 🐳 Docker

```bash
# Desarrollo
pnpm run docker:deploy

# Producción
pnpm run docker:build
```

---

## 📝 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm run start:dev` | Inicia el servidor en modo desarrollo |
| `pnpm run build` | Compila el proyecto para producción |
| `pnpm run start:prod` | Inicia el servidor en modo producción |
| `pnpm run seed` | Ejecuta los seeders de base de datos |
| `pnpm run test` | Ejecuta los tests unitarios |
| `pnpm run test:e2e` | Ejecuta los tests end-to-end |
| `pnpm run docker:deploy` | Levanta el entorno Docker de desarrollo |

---

## 🗂️ Estructura del Proyecto

```
src/
├── auth/                # Autenticación y Autorización
│   ├── decorators/      # Decoradores personalizados
│   ├── entities/        # AuditLog
│   ├── guards/          # Guards personalizados
│   ├── interceptors/    # Interceptors personalizados
│   ├── services/        # AuditService
│   └── strategies/     # Estrategias de autenticación
├── common/              # Filtros, interceptores, pipes globales
│   ├── directives/      # Directivas personalizadas
│   ├── entities/        # AuditLog
│   ├── plugins/         # Plugins personalizados
│   ├── scalars/         # Escalares personalizados
├── database/            # Configuración de DB y seeders
│   ├── entities/        # AuditLog
│   └── seeds/           # Datos iniciales
├── modules/             # Módulos de dominio
│   └── users/           # Usuarios del sistema
├── app.module.ts        # Módulo raíz
└── main.ts              # Entry point
```

---

## 📈 Próximos Pasos

- [ ] Configurar CI/CD pipeline (GitHub Actions / GitLab CI)
- [ ] Implementar tests unitarios y de integración completos
- [ ] Documentación de usuario final

---

## 🤝 Contribución

Para contribuir al proyecto:

1. Revisa `GEMINI.md` para las directrices de desarrollo
2. Sigue las convenciones de código establecidas
3. Documenta todos los cambios en `CHANGELOG.md`
4. Asegúrate de que todos los tests pasen
5. Ejecuta `pnpm run seed` después de cambios en entidades

---

## 📄 Licencia

Este proyecto es propiedad de ANSV (Agencia Nacional de Seguridad Vial).

---

## 👥 Equipo

Desarrollado por **Facundo Cachan** para ANSV.

**Contacto**: [@facundo-cachan](https://github.com/facundo-cachan/)

---

## 🆘 Soporte

Para reportar bugs o solicitar features:
- Crea un issue en el repositorio
- Contacta al equipo de desarrollo

---

**Última actualización**: Diciembre 2025
