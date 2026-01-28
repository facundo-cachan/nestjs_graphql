import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('log_auditoria')
export class AuditLog {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'ProductsModule' })
  @Column()
  module: string;

  @ApiProperty({ example: 'CREATE_PRODUCT' })
  @Column()
  action: string;

  @ApiProperty({ example: 1 })
  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @CreateDateColumn({ name: 'fecha_hora' })
  timestamp: Date;

  @ApiProperty({ example: { id: 5, serie: 'SN123' } })
  @Column({ type: 'json', nullable: true })
  details: any;

  @ApiProperty({ example: '127.0.0.1' })
  @Column({ nullable: true })
  ip: string;
}
