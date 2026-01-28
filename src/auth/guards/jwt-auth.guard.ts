import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { User } from 'src/modules/users/user.entity';

/**
 * JWT Authentication Guard.
 *
 * @description Validates JWT tokens on protected routes.
 * Routes marked with @Public() decorator bypass authentication.
 *
 * @example
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@Request() req) {
 *   return req.user;
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Determines if the route requires authentication.
   *
   * @param context Execution context
   * @returns Promise<boolean> or boolean
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * Handles authentication errors.
   *
   * @param err Error object
   * @param user Authenticated user
   * @returns Authenticated user
   * @throws UnauthorizedException if authentication fails
   */
  handleRequest<TUser = User>(err: any, user: TUser): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o expirado');
    }
    return user;
  }
}
