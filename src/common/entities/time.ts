import { Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export interface DatetimeProps {
  /** The date when the record was created */
  createdAt: string | Date | null;
  /** The date when the record was last updated */
  updatedAt: string | Date | null;
}

export class Time implements DatetimeProps {
  @ApiProperty({
    type: Date,
    description: 'Fecha de creacion',
    example: '2022-01-01T00:00:00.000Z',
  })
  @Column()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Fecha de actualizacion',
    example: '2022-01-01T00:00:00.000Z',
  })
  @Column()
  updatedAt: Date;
}
