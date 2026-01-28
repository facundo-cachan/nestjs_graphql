# NestJS GraphQL Boilerplate

Boilerplate para aplicaciones NestJS con GraphQL

**Versión**: 1.0.0  
**Estado**: En Desarrollo

## 📋 Stack Tecnológico

- **Framework**: NestJS 10.x
- **ORM**: TypeORM
- **Base de Datos**: MySQL
- **Lenguaje**: TypeScript (strict mode)
- **Documentación**: Swagger/OpenAPI
- **Validación**: class-validator, class-transformer
- **Autenticación**: SSO externo + JWT token validation
- **Seguridad**: Snyk (escaneo continuo)

## 🚀 Características

- ✅ NestJS 10.x con TypeScript en modo estricto
- ✅ GraphQL con Apollo Server
- ✅ TypeORM integrado con MySQL
- ✅ Validación automática con class-validator y class-transformer
- ✅ Autenticación JWT con Passport
- ✅ Documentación Swagger/OpenAPI
- ✅ Guards de autenticación para GraphQL
- ✅ Módulo de usuarios ejemplo con CRUD completo
- ✅ Health check endpoint
- ✅ Configuración de entorno con dotenv
- ✅ ESLint y Prettier configurados
- ✅ Jest para testing

## 📁 Estructura del Proyecto

```
.
├── src/
│   ├── auth/                 # Módulo de autenticación
│   │   ├── decorators/       # Decoradores personalizados
│   │   ├── guards/           # Guards de autenticación
│   │   ├── strategies/       # Estrategias de Passport
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── users/                # Módulo de usuarios (ejemplo)
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── entities/         # Entidades de TypeORM
│   │   ├── users.module.ts
│   │   ├── users.resolver.ts
│   │   └── users.service.ts
│   ├── app.controller.ts     # Controlador principal
│   ├── app.module.ts         # Módulo raíz
│   ├── app.service.ts        # Servicio principal
│   └── main.ts               # Punto de entrada
├── test/                     # Tests e2e
├── .env.example              # Ejemplo de variables de entorno
├── .eslintrc.js             # Configuración ESLint
├── .prettierrc              # Configuración Prettier
├── .snyk                    # Configuración Snyk
├── nest-cli.json            # Configuración NestJS CLI
├── package.json             # Dependencies
├── tsconfig.json            # Configuración TypeScript
└── README.md

```

## 🛠️ Instalación

### Prerrequisitos

- Node.js >= 18.x
- npm >= 9.x
- MySQL >= 8.x

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/facundo-cachan/nestjs_graphql.git
   cd nestjs_graphql
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus configuraciones:
   ```env
   # Application
   NODE_ENV=development
   PORT=3000

   # Database
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=password
   DB_DATABASE=nestjs_graphql

   # JWT Authentication
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRES_IN=1h

   # GraphQL
   GRAPHQL_PLAYGROUND=true
   GRAPHQL_INTROSPECTION=true

   # Swagger
   SWAGGER_ENABLED=true
   ```

4. **Crear la base de datos**
   ```sql
   CREATE DATABASE nestjs_graphql;
   ```

5. **Ejecutar la aplicación**
   ```bash
   # Desarrollo
   npm run start:dev

   # Producción
   npm run build
   npm run start:prod
   ```

## 📖 Uso

### GraphQL Playground

Una vez iniciada la aplicación, accede al GraphQL Playground:

```
http://localhost:3000/graphql
```

### Swagger API Documentation

Documentación de la API REST disponible en:

```
http://localhost:3000/api
```

### Health Check

```
http://localhost:3000/
```

### Ejemplos de Queries GraphQL

#### 1. Crear un usuario (sin autenticación)

```graphql
mutation {
  createUser(createUserInput: {
    email: "user@example.com"
    name: "John Doe"
    avatar: "https://example.com/avatar.jpg"
  }) {
    id
    email
    name
    createdAt
  }
}
```

#### 2. Obtener token JWT (para testing)

Primero, necesitas generar un token JWT. En un ambiente real, esto vendría de tu SSO externo.

Para desarrollo, puedes usar el servicio de autenticación:

```typescript
// Ejemplo de generación de token
const token = authService.generateToken({
  sub: 'user-id',
  email: 'user@example.com'
});
```

#### 3. Consultar todos los usuarios (requiere autenticación)

```graphql
query {
  users {
    id
    email
    name
    isActive
    createdAt
  }
}
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

#### 4. Consultar usuario actual (requiere autenticación)

```graphql
query {
  me {
    id
    email
    name
    avatar
  }
}
```

#### 5. Actualizar usuario (requiere autenticación)

```graphql
mutation {
  updateUser(
    id: "user-uuid"
    updateUserInput: {
      name: "Jane Doe Updated"
      isActive: false
    }
  ) {
    id
    name
    isActive
    updatedAt
  }
}
```

## 🔐 Autenticación

Este boilerplate está configurado para usar autenticación JWT proveniente de un SSO externo.

### Flujo de Autenticación

1. El usuario se autentica con el SSO externo
2. El SSO retorna un JWT token
3. El cliente incluye el token en el header `Authorization: Bearer <token>`
4. El JwtStrategy valida el token
5. Si es válido, el usuario puede acceder a los recursos protegidos

### Proteger Endpoints GraphQL

Usa el `@UseGuards(GqlAuthGuard)` decorator:

```typescript
@Query(() => [User])
@UseGuards(GqlAuthGuard)
async findAll() {
  return this.usersService.findAll();
}
```

### Obtener Usuario Actual

Usa el decorador `@CurrentUser()`:

```typescript
@Query(() => User)
@UseGuards(GqlAuthGuard)
async me(@CurrentUser() user: JwtPayload) {
  return this.usersService.findByEmail(user.email);
}
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Scripts Disponibles

```bash
npm run build          # Compilar el proyecto
npm run start          # Iniciar en modo producción
npm run start:dev      # Iniciar en modo desarrollo (watch mode)
npm run start:debug    # Iniciar en modo debug
npm run lint           # Ejecutar ESLint
npm run format         # Formatear código con Prettier
npm run test           # Ejecutar tests
npm run test:watch     # Ejecutar tests en watch mode
npm run test:cov       # Ejecutar tests con coverage
npm run test:e2e       # Ejecutar tests e2e
```

## 🔒 Seguridad

### Snyk

El proyecto incluye configuración para Snyk para escaneo continuo de vulnerabilidades.

```bash
# Instalar Snyk CLI
npm install -g snyk

# Autenticar
snyk auth

# Escanear vulnerabilidades
snyk test

# Monitorear proyecto
snyk monitor
```

### Best Practices

- ✅ Modo estricto de TypeScript habilitado
- ✅ Validación de datos con class-validator
- ✅ Guards de autenticación implementados
- ✅ Variables de entorno para configuración sensible
- ✅ CORS habilitado y configurable
- ✅ Helmet para headers de seguridad (recomendado añadir)

## 🚀 Deployment

### Preparación para Producción

1. **Configurar variables de entorno de producción**
2. **Deshabilitar GraphQL Playground**
   ```env
   GRAPHQL_PLAYGROUND=false
   GRAPHQL_INTROSPECTION=false
   ```
3. **Usar secretos fuertes**
   ```env
   JWT_SECRET=<strong-random-secret>
   ```
4. **Sincronización de base de datos**
   ```env
   TYPEORM_SYNCHRONIZE=false
   ```
   
   Usar migraciones en su lugar:
   ```bash
   npm run typeorm migration:generate -- -n MigrationName
   npm run typeorm migration:run
   ```

### Docker (Opcional)

Puedes crear un Dockerfile para containerizar la aplicación:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📚 Recursos

- [NestJS Documentation](https://docs.nestjs.com/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [TypeORM Documentation](https://typeorm.io/)
- [Passport JWT](http://www.passportjs.org/packages/passport-jwt/)
- [Class Validator](https://github.com/typestack/class-validator)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👤 Autor

Facundo Cachan

## 🙏 Agradecimientos

- NestJS Team
- TypeORM Team
- Apollo GraphQL Team
