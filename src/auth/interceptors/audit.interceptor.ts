import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

import { AuditService } from '../services/audit.service';

interface RequestWithUser extends Request {
  user?: {
    id?: string;
    sub?: string;
    userId?: string;
    username?: string;
    role?: string;
    roles?: string[];
  };
  correlationId?: string;
}

interface ErrorWithStatus extends Error {
  status?: number;
}

/**
 * Intercepts all requests to create audit logs.
 *
 * @description Captures request context, execution time, and outcomes (success/failure).
 * Implements non-blocking logging to avoid impacting response times.
 * Adds correlation ID for distributed tracing across microservices.
 *
 * @example
 * Apply globally in app.module.ts:
 * providers: [{ provide: APP_INTERCEPTOR, useClass: AuditInterceptor }]
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditInterceptor');

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Generate or extract correlation ID for distributed tracing
    const correlationId =
      (request.headers['x-correlation-id'] as string) || uuidv4();
    request.correlationId = correlationId;

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logAction(context, correlationId, duration);
      }),
      catchError((err: ErrorWithStatus) => {
        const duration = Date.now() - startTime;
        this.logAction(context, correlationId, duration, err);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Creates audit log entry asynchronously.
   *
   * @param context Execution context
   * @param correlationId Request correlation ID
   * @param duration Request processing duration in ms
   * @param error Optional error object
   * @private
   */
  private logAction(
    context: ExecutionContext,
    correlationId: string,
    duration: number,
    error?: ErrorWithStatus,
  ) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const response = context.switchToHttp().getResponse<Response>();

    const userId =
      request.user?.sub ||
      request.user?.userId ||
      request.user?.id ||
      'ANONYMOUS';
    const method = request.method;
    const url = request.url;
    const statusCode = error ? error.status || 500 : response.statusCode;
    const ipAddress = request.ip || 'unknown';
    const userAgent = (request.headers['user-agent'] as string) || 'unknown';

    const logEntry = {
      correlationId,
      userId,
      appId: process.env.APP_NAME || 'SIGESTA_AUTH_PROXY',
      action: method,
      resource: url,
      statusCode,
      ipAddress,
      userAgent,
      metadata: {
        duration: `${duration}ms`,
        roles: request.user?.roles || [],
        error: error?.message || null,
      },
    };

    // Non-blocking write: don't await to avoid adding latency
    this.auditService.createLog(logEntry).catch((err: Error) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Failed to persist audit log: ${errorMessage}`);
    });
  }
}
