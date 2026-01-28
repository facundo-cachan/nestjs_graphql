# NestJS GraphQL Project - Build Tasks

This document outlines the steps required to build and set up a NestJS GraphQL application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher recommended)
- **npm** (v9.x or higher) or **yarn** (v1.22.x or higher)
- **Git** (for version control)

## Project Initialization

### 1. Install NestJS CLI

```bash
npm install -g @nestjs/cli
```

### 2. Create New NestJS Project

```bash
# If starting from scratch (not in existing repo)
nest new nestjs_graphql

# Or initialize in the current directory (requires empty directory)
# Note: The directory must be empty for this command to work
nest new .
```

When prompted, choose your preferred package manager (npm or yarn).

**Note**: If you're working with an existing repository, you can manually create the necessary files or use the CLI to generate individual components instead of initializing a full project.

## Install Dependencies

### 3. Install GraphQL Dependencies

```bash
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

### 4. Install Additional Dependencies (Optional but Recommended)

```bash
# For database support (PostgreSQL example)
npm install @nestjs/typeorm typeorm pg

# For configuration management
npm install @nestjs/config

# For validation
npm install class-validator class-transformer

# For development
npm install --save-dev @types/node
```

## Project Structure

After initialization, your project should have the following structure:

```
project-root/
├── src/
│   ├── app.module.ts          # Root application module
│   ├── app.controller.ts      # Basic controller
│   ├── app.service.ts         # Basic service
│   └── main.ts                # Application entry point
├── test/                      # E2E tests
├── node_modules/              # Dependencies
├── package.json               # Project metadata and dependencies
├── tsconfig.json              # TypeScript configuration
├── nest-cli.json              # NestJS CLI configuration
└── README.md                  # Project documentation
```

## Configuration

### 5. Configure GraphQL Module

Edit `src/app.module.ts` to include GraphQL configuration:

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // For Apollo Server v4+, use introspection instead of playground
      introspection: true,
      // For Apollo Server v3, you can use: playground: true
    }),
  ],
})
export class AppModule {}
```

### 6. Create GraphQL Resolvers and Schema

Create a sample module (e.g., `items` or `users`):

```bash
nest generate module items
nest generate resolver items
nest generate service items
```

## Building the Application

### 7. Build for Development

```bash
# Start development server with hot-reload
npm run start:dev
```

### 8. Build for Production

```bash
# Compile TypeScript to JavaScript
npm run build

# Start production server
npm run start:prod
```

### 9. Verify Build Output

The compiled application will be in the `dist/` directory:

```bash
ls -la dist/
```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

The server will start on `http://localhost:3000` (default).
GraphQL endpoint will be available at `http://localhost:3000/graphql`.

**GraphQL IDE Access**:
- For **Apollo Server v4+**: Navigate to `http://localhost:3000/graphql` in your browser, and Apollo Sandbox will launch automatically
- For **Apollo Server v3**: GraphQL Playground will be available at the same URL if configured
- Alternatively, use standalone tools like [GraphQL Playground](https://github.com/graphql/graphql-playground) or [Altair GraphQL Client](https://altairgraphql.dev/)

### Production Mode

```bash
npm run build
npm run start:prod
```

### Standard Mode (No Hot-Reload)

```bash
npm run start
```

**Note**: This runs the application without watch mode. For development with hot-reload, use `npm run start:dev` instead.

## Testing

### 10. Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development Workflow

### Common Commands

```bash
# Generate a new module
nest generate module <module-name>

# Generate a new controller
nest generate controller <controller-name>

# Generate a new service
nest generate service <service-name>

# Generate a new resolver (for GraphQL)
nest generate resolver <resolver-name>

# Generate a complete CRUD resource
nest generate resource <resource-name>
```

### Code Linting

```bash
# Lint the code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Code Formatting

```bash
# Format code with Prettier
npm run format
```

## Environment Variables

### 11. Setup Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=nestjs_graphql
```

## GraphQL Schema Generation

NestJS GraphQL supports two approaches:

1. **Code First (Recommended for TypeScript)**: Schema is auto-generated from TypeScript classes
2. **Schema First**: Write `.graphql` files manually

This project uses **Code First** approach with `autoSchemaFile` configuration.

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS GraphQL Documentation](https://docs.nestjs.com/graphql/quick-start)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL Documentation](https://graphql.org/learn/)

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `src/main.ts` or use `PORT` environment variable
2. **Module not found errors**: Run `npm install` to ensure all dependencies are installed
3. **TypeScript compilation errors**: Check `tsconfig.json` configuration
4. **GraphQL schema errors**: Verify resolver decorators and type definitions

## Next Steps

1. Define your data models using TypeScript classes
2. Create GraphQL resolvers for queries and mutations
3. Connect to a database (PostgreSQL, MongoDB, etc.)
4. Implement authentication and authorization
5. Add input validation using `class-validator`
6. Set up logging and monitoring
7. Configure CORS if needed for frontend integration
8. Write comprehensive tests

## Summary

This TASK.md provides a complete guide to:
- ✅ Setting up a new NestJS GraphQL project
- ✅ Installing and configuring dependencies
- ✅ Building the application
- ✅ Running in development and production modes
- ✅ Testing and development workflow
- ✅ Common commands and best practices

Follow these steps sequentially to build a production-ready NestJS GraphQL application.
