import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

interface UserWithRoles {
  roles?: string[];
}

interface RequestWithUser {
  user?: UserWithRoles;
}

/**
 * Guard for role-based authorization.
 *
 * @description Checks if authenticated user has required roles for the endpoint.
 * Roles are defined using @Roles() decorator on controllers/methods.
 *
 * @example
 * @Roles('admin', 'manager')
 * @Get('protected')
 * protectedRoute() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Check if user has any of the required roles
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
