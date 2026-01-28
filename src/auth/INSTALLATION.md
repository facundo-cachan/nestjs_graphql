# Auth Module - Installation Guide

## Overview
This module implements the Auth & Access Audit Proxy (AAAP) architecture for centralized authentication and authorization.

## Dependencies

Install the required packages:

```bash
pnpm add passport passport-ldapauth passport-jwt @nestjs/passport @nestjs/jwt ldapauth-fork uuid
pnpm add -D @types/passport-ldapauth @types/passport-jwt @types/uuid
```

## Database Setup

Execute the SQL schema to create the `access_logs` table:

```bash
# Using Docker
docker exec -i sigesta-mysql mysql -u admin -p1q2w3e sigesta-backend < src/auth/access-logs.sql

# Or directly via MySQL client
mysql -u admin -p1q2w3e sigesta-backend < src/auth/access-logs.sql
```

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# LDAP Configuration
LDAP_URL=ldap://localhost:389
LDAP_BIND_DN=cn=admin,dc=organizacion,dc=com
LDAP_BIND_PASSWORD=adminpassword
LDAP_SEARCH_BASE=dc=organizacion,dc=com
LDAP_GROUP_BASE=ou=groups,dc=organizacion,dc=com

# JWT Configuration
JWT_SECRET=super_secret_key_123
JWT_EXPIRATION=1h

# Application
APP_NAME=SIGESTA_AUTH_PROXY
```

### Module Integration

Add `AuthModule` to your `app.module.ts`:

```typescript
import { AuthModule } from '@/sigesta-auth/auth.module';
import { AuditInterceptor } from '@/sigesta-auth/interceptors/audit.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    // ... other modules
    AuthModule,
  ],
  providers: [
    // Enable global audit logging
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
```

### Database Configuration

Add `AccessLog` entity to your database module:

```typescript
import { AccessLog } from '@/sigesta-auth/entities/access-log.entity';

TypeOrmModule.forRoot({
  // ... existing config
  entities: [
    // ... other entities
    AccessLog,
  ],
})
```

## Testing with Docker

Use the included `docker-compose.yml` to spin up a test LDAP server:

```bash
cd src/auth
docker-compose up -d
```

This will start:
- OpenLDAP server on port 389
- phpLDAPadmin UI on http://localhost:8080
- PostgreSQL audit database on port 5432

### Adding Test Users to LDAP

Access phpLDAPadmin at http://localhost:8080 and create test users with:
- Login DN: `cn=admin,dc=organizacion,dc=com`
- Password: `adminpassword`

## API Usage

### Login Endpoint

```bash
POST http://localhost:3200/auth/login
Content-Type: application/json

{
  "username": "jdoe",
  "password": "password123"
}
```

**Response:**
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

### Using the Token

Include the token in subsequent requests:

```bash
GET http://localhost:3200/persons
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Security Considerations

1. **Production Secrets**: Use AWS Secrets Manager or HashiCorp Vault for `JWT_SECRET`
2. **TLS/SSL**: Enable LDAPS (port 636) for production LDAP connections
3. **Token Algorithm**: Switch from HS256 to RS256 with public/private keys
4. **Token Blacklist**: Implement Redis-based token revocation for logout
5. **Rate Limiting**: Add throttling to prevent brute-force attacks

## Audit Logs

All authenticated requests are automatically logged to `access_logs` table with:
- Correlation ID for distributed tracing
- User identity and IP address
- Request method, resource, and status code
- Execution duration and error details

Query audit logs:

```sql
-- Recent activity for a user
SELECT * FROM access_logs 
WHERE userId = 'jdoe123' 
ORDER BY createdAt DESC 
LIMIT 100;

-- Trace a specific request flow
SELECT * FROM access_logs 
WHERE correlationId = '550e8400-e29b-41d4-a716-446655440001' 
ORDER BY createdAt ASC;
```

## Architecture Notes

- **Stateless**: No session storage, fully JWT-based
- **Distributed**: Correlation IDs enable tracing across microservices
- **Non-blocking**: Audit logging is asynchronous to minimize latency
- **Scalable**: Can run multiple instances behind a load balancer
