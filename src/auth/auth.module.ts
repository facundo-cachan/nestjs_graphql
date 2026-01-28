import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { AuditService } from './services/audit.service';
import { SsoJwtStrategy } from './strategies/sso-jwt.strategy';
import { AccessLog } from './entities/access-log.entity';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersModule } from '../modules/users/user.module';

import type { JwtModuleOptions } from '@nestjs/jwt';

/**
 * Authentication and Authorization Module with SSO Integration.
 *
 * @description Provides SSO token validation, JWT verification, and audit logging.
 * Authentication is handled by an external SSO provider.
 * This module only validates tokens and manages user sessions.
 *
 * Features:
 * - SSO JWT token validation
 * - User profile retrieval from database
 * - Immutable audit logging for all access attempts
 * - Distributed tracing with correlation IDs
 * - Role-based access control with local user roles
 *
 * @remarks
 * - Uses forwardRef() to resolve circular dependency with UserModule
 * - UserModule imports AuthModule for guards
 * - AuthModule imports UserModule for UserService
 * - Authentication is delegated to external SSO provider
 * - Tokens are validated using shared JWT secret
 *
 * @example
 * Import in app.module.ts:
 * imports: [AuthModule]
 *
 * Apply audit interceptor globally:
 * providers: [{ provide: APP_INTERCEPTOR, useClass: AuditInterceptor }]
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([AccessLog]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: (
          configService.get<string>('JWT_SECRET') ||
          configService.get<string>('SSO_JWT_SECRET_PRIVATE') ||
          'a-string-secret-at-least-256-bits-long'
        ).replaceAll(/\\n/g, '\n'),
        signOptions: {
          expiresIn: configService.get<number>('JWT_EXPIRATION') || 60 * 60,
          algorithm: 'HS256' as const,
          issuer: configService.get<string>('SSO_ISSUER') || 'external-sso',
        },
        verifyOptions: {
          algorithms: ['HS256', 'RS256'],
          issuer: configService.get<string>('SSO_ISSUER') || 'external-sso',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuditService,
    SsoJwtStrategy,
    AuditInterceptor,
    RolesGuard,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    AuditService,
    AuditInterceptor,
    RolesGuard,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
