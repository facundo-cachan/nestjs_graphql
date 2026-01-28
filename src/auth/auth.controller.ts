import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { AuthService } from './services/auth.service';
import { Public } from './decorators/public.decorator';
import { SsoLoginDto } from './dto/sso-login.dto';

import type {
  AuthResponse,
  User,
  UserCredentials,
} from '../modules/users/user.entity';

/**
 * Authentication controller for SSO token validation.
 *
 * @description Handles SSO token validation and user profile retrieval.
 * Authentication is performed by an external SSO provider.
 * This controller only validates existing tokens and provides user information.
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Sign in with username and password (local authentication).
   *
   * @param credentials User credentials
   * @returns JWT token and user information
   *
   * @description Authenticates user against local database and generates JWT token.
   * This is an alternative to SSO authentication, useful for development and testing.
   *
   * @example
   * POST /auth/signIn
   * Body: { "username": "juan.perez", "password": "password123" }
   *
   * Response:
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "user": {
   *     "id": 1,
   *     "username": "juan.perez",
   *     "role": "OPERATOR"
   *   }
   * }
   */
  @Public()
  @Post('signIn')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in with username and password',
    description: 'Local authentication - generates JWT token',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string', example: 'juan.perez' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    schema: {
      properties: {
        access_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(@Body() credentials: UserCredentials): Promise<AuthResponse> {
    const authResponse = await this.authService.signIn(credentials);

    if (!authResponse) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return authResponse;
  }

  @Public()
  @Post('sso-sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in with SSO Token',
    description: 'Exchange SSO Token for Local Session Token',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['token'],
      properties: {
        token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    schema: {
      properties: {
        access_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async ssoSignIn(@Body() body: SsoLoginDto): Promise<AuthResponse> {
    return this.authService.ssoSignIn(body.token);
  }

  /**
   * Get authenticated user profile.
   *
   * @param req Request object with validated user
   * @returns User profile information
   *
   * @description Validates SSO JWT token and returns user information from database.
   * The token must be provided in the Authorization header as Bearer token.
   *
   * @example
   * GET /auth/profile
   * Headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
   *
   * Response:
   * {
   *   "id": 1,
   *   "username": "juan.perez",
   *   "email": "juan.perez@example.com",
   *   "role": "OPERATOR",
   *   "status": 1,
   *   "createdAt": "2024-01-01T00:00:00.000Z",
   *   "updatedAt": "2024-01-01T00:00:00.000Z"
   * }
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get authenticated user profile',
    description: 'Returns user information from validated SSO token',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      properties: {
        id: { type: 'number' },
        username: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string' },
        status: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  getProfile(@Request() req: { user: User }) {
    return req.user;
  }

  /**
   * Validate SSO token.
   *
   * @param req Request object with validated user
   * @returns Validation status and user info
   *
   * @description Validates SSO JWT token without returning full user profile.
   * Useful for checking if a token is still valid.
   *
   * @example
   * GET /auth/validate
   * Headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
   *
   * Response:
   * {
   *   "valid": true,
   *   "username": "juan.perez",
   *   "role": "OPERATOR"
   * }
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('validate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Validate SSO token',
    description: 'Checks if the provided SSO token is valid',
  })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    schema: {
      properties: {
        valid: { type: 'boolean' },
        username: { type: 'string' },
        role: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  validateToken(@Request() req: { user: User }) {
    return {
      valid: true,
      username: req.user.username,
      role: req.user.role,
    };
  }

  /**
   * Health check endpoint (no authentication required).
   *
   * @returns Status object
   *
   * @description Provides service health status and configuration information.
   * Useful for monitoring and debugging.
   */
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check for auth service' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      properties: {
        status: { type: 'string' },
        service: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        ssoProvider: { type: 'string' },
      },
    },
  })
  health() {
    return {
      status: 'ok',
      service: 'auth-sso',
      timestamp: new Date().toISOString(),
      ssoProvider: process.env.SSO_ISSUER || 'external-sso',
    };
  }
}
