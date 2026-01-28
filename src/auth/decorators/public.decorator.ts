import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark routes as public (skip JWT authentication).
 *
 * @description Use this decorator on routes that don't require authentication.
 * The JwtAuthGuard will check for this metadata and skip validation.
 *
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 */
export const Public = () => SetMetadata('isPublic', true);
