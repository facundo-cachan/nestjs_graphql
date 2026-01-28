import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccessLog } from '../entities/access-log.entity';

/**
 * Service for managing audit logs.
 *
 * @description Handles asynchronous persistence of access logs for security auditing.
 * Designed for high-throughput scenarios with non-blocking writes.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AccessLog)
    private readonly auditRepo: Repository<AccessLog>,
  ) {}

  private formatError(error: unknown): { message: string; stack?: string } {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
      };
    }
    return {
      message: String(error),
    };
  }

  /**
   * Creates an audit log entry.
   *
   * @param data Partial access log data
   * @returns Promise<void>
   * @description Non-blocking write operation. Errors are logged but don't throw.
   */
  async createLog(data: Partial<AccessLog>): Promise<void> {
    try {
      const log = this.auditRepo.create(data);
      await this.auditRepo.save(log);
      this.logger.debug(`Audit log created: ${data.correlationId}`);
    } catch (error) {
      const formatted = this.formatError(error);
      this.logger.error(
        `Failed to persist audit log: ${formatted.message}`,
        formatted.stack,
      );
    }
  }

  /**
   * Retrieves audit logs for a specific user.
   *
   * @param userId User identifier
   * @param limit Maximum number of records
   * @returns Promise<AccessLog[]>
   */
  async findByUser(userId: string, limit: number = 100): Promise<AccessLog[]> {
    return this.auditRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Retrieves audit logs by correlation ID for distributed tracing.
   *
   * @param correlationId Unique request identifier
   * @returns Promise<AccessLog[]>
   */
  async findByCorrelationId(correlationId: string): Promise<AccessLog[]> {
    return this.auditRepo.find({
      where: { correlationId },
      order: { createdAt: 'ASC' },
    });
  }
}
