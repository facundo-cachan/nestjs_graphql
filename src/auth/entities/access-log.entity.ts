import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Time } from 'src/common/entities/time';

/**
 * Entity for audit logs - tracks all access attempts to the system.
 *
 * @description Stores immutable records of user access for security auditing and compliance.
 * Uses JSONB for flexible metadata storage and correlation IDs for distributed tracing.
 */
@Entity('access_logs')
export class AccessLog extends Time {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @Index()
  @Column()
  correlationId: string;

  @ApiProperty({ example: 'jdoe123' })
  @Index()
  @Column()
  userId: string;

  @ApiProperty({ example: 'SIGESTA_BACKEND' })
  @Column()
  appId: string;

  @ApiProperty({ example: 'GET' })
  @Column()
  action: string;

  @ApiProperty({ example: '/api/v1/user/profile' })
  @Column()
  resource: string;

  @ApiProperty({ example: 200 })
  @Column()
  statusCode: number;

  @ApiProperty({ example: '192.168.1.100' })
  @Column()
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0...' })
  @Column({ nullable: true })
  userAgent: string;

  @ApiProperty({ example: { duration: '120ms', roles: ['user', 'admin'] } })
  @Column({ type: 'json', nullable: true })
  metadata: any;
}
