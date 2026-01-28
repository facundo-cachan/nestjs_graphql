import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { User } from 'src/modules/users/user.entity';
import { UsersService } from 'src/modules/users/user.service';

/**
 * JWT payload interface from SSO provider
 * @description Represents the decoded JWT token from external SSO
 */
export interface SsoJwtPayload {
  /** User unique identifier */
  sub: string;
  /** Username or email */
  username: string;
  /** User role */
  role: string;
  /** Token issuer (SSO provider) */
  iss: string;
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
}

/**
 * SSO JWT Strategy for validating external SSO tokens.
 *
 * @description Validates JWT tokens issued by an external SSO provider.
 * Extracts user information from the token and validates against local database.
 * Does NOT authenticate users - only validates existing SSO tokens.
 *
 * @example
 * // In the controller:
 * @UseGuards(AuthGuard('jwt'))
 * async getProfile(@Request() req) {
 *   return req.user; // Contains validated user from database
 * }
 */
@Injectable()
export class SsoJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(SsoJwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: (
        configService.get<string>('SSO_JWT_SECRET') ||
        configService.get<string>('JWT_SECRET') ||
        'super_secret_key_123'
      ).replaceAll('\n', '\n'),
      issuer: configService.get<string>('SSO_ISSUER') || 'external-sso',
      algorithms: ['HS256', 'RS256'],
    });

    this.logger.log('SSO JWT Strategy initialized');
  }

  /**
   * Validates JWT payload and retrieves user from database.
   *
   * @param payload Decoded JWT payload from SSO
   * @returns User object from database
   * @throws UnauthorizedException if user not found or inactive
   *
   * @example
   * // Payload structure:
   * {
   *   sub: "user123",
   *   username: "juan.perez",
   *   role: "OPERATOR",
   *   iss: "external-sso",
   *   iat: 1234567890,
   *   exp: 1234571490
   * }
   */
  async validate(payload: SsoJwtPayload): Promise<User> {
    this.logger.debug(`Validating SSO token for user: ${payload.username}`);

    try {
      // Find user in local database by username
      const user = await this.userService.findOne({
        where: { username: payload.username },
      });

      if (!user) {
        this.logger.warn(`User not found in database: ${payload.username}`);
        throw new UnauthorizedException('Usuario no encontrado en el sistema');
      }

      // Verify user is active
      if (user.status !== 1) {
        this.logger.warn(`Inactive user attempted access: ${payload.username}`);
        throw new UnauthorizedException('Usuario inactivo');
      }

      // Verify role matches (if SSO provides role)
      if (payload.role && user.role !== payload.role) {
        this.logger.warn(
          `Role mismatch for user ${payload.username}: SSO=${payload.role}, DB=${user.role}`,
        );
        // You can choose to update the role or reject the token
        // For now, we'll trust the database role
      }

      this.logger.log(
        `SSO token validated successfully for: ${payload.username}`,
      );

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `Error validating SSO token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Error al validar el token SSO');
    }
  }
}
