import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { SsoJwtPayload } from '../strategies/sso-jwt.strategy';
import { UsersService } from 'src/modules/users/user.service';

import type {
  AuthResponse,
  User,
  UserCredentials,
} from 'src/modules/users/user.entity';

/**
 * Service for SSO token validation and management.
 *
 * @description Handles JWT token validation from external SSO provider.
 * This service does NOT authenticate users - authentication is handled by the external SSO.
 * It only validates existing tokens and manages user sessions.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  /**
   * Verifies if a user has a specific role.
   *
   * @param user User object
   * @param requiredRole Required role
   * @returns True if user has the role
   *
   * @example
   * const hasRole = authService.hasRole(user, 'ADMIN');
   */
  hasRole(user: User, requiredRole: string): boolean {
    return user.role === requiredRole;
  }

  /**
   * Checks if user has any of the specified roles.
   *
   * @param user User object
   * @param roles Array of allowed roles
   * @returns True if user has at least one of the roles
   *
   * @example
   * const hasAccess = authService.hasAnyRole(user, ['ADMIN', 'OPERATOR']);
   */
  hasAnyRole(user: User, roles: string[]): boolean {
    return roles.includes(user.role);
  }

  /**
   * Validates a JWT token from SSO provider.
   *
   * @param token JWT string from Authorization header
   * @returns Decoded payload if valid
   * @throws UnauthorizedException if invalid or expired
   *
   * @example
   * const payload = await authService.validateToken('eyJhbGc...');
   */
  validateToken(token: string): SsoJwtPayload {
    this.logger.debug(`Token validated for user: ${token}`);
    try {
      const payload = this.jwtService.verify<SsoJwtPayload>(token);
      this.logger.debug(
        `Token validated for user: ${payload.username || payload.sub}`,
      );
      return payload;
    } catch (error) {
      this.logger.warn(
        `Invalid token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Retrieves user information from database by username.
   *
   * @param username Username from SSO token
   * @returns User object with role and permissions
   * @throws UnauthorizedException if user not found or inactive
   *
   * @example
   * const user = await authService.getUserByUsername('juan.perez');
   */
  async getUserByUsername(username: string): Promise<User> {
    const user = await this.userService.findOne({ username });

    if (!user) {
      this.logger.warn(`User not found: ${username}`);
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.status !== 1) {
      this.logger.warn(`Inactive user: ${username}`);
      throw new UnauthorizedException('Usuario inactivo');
    }

    return user;
  }

  /**
   * Authenticates a user with username and password (local authentication).
   *
   * @param credentials User credentials (username and password)
   * @returns JWT token and user information, or null if authentication fails
   *
   * @description This method provides local authentication as an alternative to SSO.
   * It validates credentials against the local database and generates a JWT token.
   * Useful for development or as a fallback when SSO is not available.
   *
   * @example
   * const result = await authService.signIn({
   *   username: 'juan.perez',
   *   password: 'password123'
   * });
   * // Returns: { access_token: '...', user: { id, username, role } } or null
   */
  async signIn(credentials: UserCredentials): Promise<AuthResponse | null> {
    this.logger.debug(`Sign-in attempt for user: ${credentials.username}`);

    try {
      // Find user by username
      const user = await this.userService.findOne({
        username: credentials.username,
      });

      console.log(user);

      if (!user) {
        this.logger.warn(`User not found: ${credentials.username}`);
        return null;
      }

      // Verify user is active
      if (user.status !== 1) {
        this.logger.warn(
          `Inactive user attempted login: ${credentials.username}`,
        );
        return null;
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password,
      );

      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${credentials.username}`);
        return null;
      }

      // Generate JWT token
      const payload = {
        sub: user.id.toString(),
        username: user.username,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
      };

      const access_token = this.jwtService.sign(payload);

      this.logger.log(`Sign-in successful for user: ${credentials.username}`);

      return {
        access_token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `Error during sign-in: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Error al procesar la autenticación');
    }
  }

  /**
   * Authenticates a user using an SSO token.
   *
   * @param token SSO JWT token
   * @returns JWT token and user information, or null if authentication fails
   *
   * @description Validates the SSO token, checks for user existence in local DB,
   * and issues a new local session token.
   */
  async ssoSignIn(token: string): Promise<AuthResponse> {
    this.logger.debug('SSO Sign-in attempt');

    try {
      // 1. Validate the SSO Token
      const ssoPayload = this.validateToken(token);
      const username = ssoPayload.username || ssoPayload.sub;

      this.logger.debug(`SSO Sign-in successful for user: ${username}`);
      this.logger.debug(
        `SSO Sign-in successful for user: ${JSON.stringify(ssoPayload)}`,
      );

      // 2. Find user locally
      const user = await this.userService.findOne({
        where: { username },
      });

      if (!user) {
        this.logger.warn(`User not found in local DB: ${username}`);
        throw new UnauthorizedException('Usuario no encontrado en el sistema');
      }

      if (user.status !== 1) {
        this.logger.warn(`Inactive user tried to login: ${username}`);
        throw new UnauthorizedException('Usuario inactivo');
      }

      // 3. Generate Local Session Token
      const payload = {
        sub: user.id.toString(),
        username: user.username,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
      };

      const access_token = this.jwtService.sign(payload);

      this.logger.log(`SSO Sign-in successful for user: ${username}`);

      return {
        access_token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `SSO Sign-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Error en la autenticación SSO');
    }
  }
}
