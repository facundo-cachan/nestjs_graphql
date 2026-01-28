import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * DTO para la creación de usuarios del sistema SIGESTA
 *
 * @description
 * Define los datos necesarios para crear un nuevo usuario en el sistema.
 * Incluye validaciones para garantizar la integridad de los datos.
 * Todos los campos son obligatorios para la creación.
 *
 * @remarks
 * - El username debe ser único en el sistema
 * - La contraseña debe tener al menos 6 caracteres
 * - El rol determina los permisos del usuario en el sistema
 * - El status indica si el usuario está activo o inactivo
 *
 * @example
 * ```typescript
 * const createUserInput: CreateUserInput = {
 *   id: 1,
 *   personId: 123,
 *   username: 'jdoe',
 *   password: 'SecurePass123',
 *   role: 'operator',
 *   status: 'active'
 * };
 * ```
 *
 * @see {@link User} - Entidad de usuario
 * @see {@link UpdateUserDto} - DTO para actualización de usuarios
 *
 * @author Facundo Cachan
 * @version 1.0.0
 * @since 1.0.0
 */
export class CreateUserInput {
  /**
   * Identificador único del usuario
   *
   * @type {number}
   * @example 1
   */
  @ApiProperty({
    description: 'Identificador único del usuario',
    type: Number,
    example: 1,
  })
  @IsNumber({}, { message: 'El ID debe ser un número' })
  @IsNotEmpty({ message: 'El ID es obligatorio' })
  id: number;

  /**
   * Identificador de la persona asociada al usuario
   *
   * @type {number}
   * @example 123
   */
  @ApiProperty({
    description: 'Identificador de la persona asociada al usuario',
    type: Number,
    example: 123,
  })
  @IsNumber({}, { message: 'El ID de persona debe ser un número' })
  @IsNotEmpty({ message: 'El ID de persona es obligatorio' })
  personId: number;

  /**
   * Nombre de usuario único para autenticación
   *
   * @type {string}
   * @example 'jdoe'
   */
  @ApiProperty({
    description: 'Nombre de usuario único para autenticación',
    type: String,
    example: 'jdoe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'El username debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El username es obligatorio' })
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El username no puede exceder 50 caracteres' })
  username: string;

  /**
   * Contraseña del usuario (será hasheada antes de almacenarse)
   *
   * @type {string}
   * @example 'SecurePass123'
   */
  @ApiProperty({
    description: 'Contraseña del usuario',
    type: String,
    example: 'SecurePass123',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  /**
   * Rol del usuario en el sistema (determina permisos)
   *
   * @type {string}
   * @example 'operator'
   * @remarks Valores comunes: 'admin', 'operator', 'viewer'
   */
  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    type: String,
    example: 'operator',
    enum: ['admin', 'operator', 'viewer'],
  })
  @IsString({ message: 'El rol debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  role: string;

  /**
   * Estado actual del usuario
   *
   * @type {string}
   * @example 'active'
   * @remarks Valores comunes: 'active', 'inactive', 'suspended'
   */
  @ApiProperty({
    description: 'Estado actual del usuario',
    type: Number,
    example: 1,
  })
  @IsNumber({}, { message: 'El status debe ser un número' })
  @IsNotEmpty({ message: 'El status es obligatorio' })
  status: number;
}
