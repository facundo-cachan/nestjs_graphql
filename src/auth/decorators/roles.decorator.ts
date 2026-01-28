import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to define required roles for a route.
 *
 * @param roles Array of role names
 * @returns Metadata decorator
 *
 * @example
 * @Roles('admin', 'manager')
 * @Get('protected')
 * adminOnlyRoute() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
