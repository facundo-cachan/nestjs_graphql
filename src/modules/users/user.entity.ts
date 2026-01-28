import { Entity, Column, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Time } from 'src/common/entities/time';

export interface IUser extends Time {
  id: number;
  personId: string;
  username: string;
  password: string;
  role: string;
  status: number;
}
export interface AuthResponse {
  access_token: string;
  user: {
    id: IUser['id'];
    username: IUser['username'];
    role: IUser['role'];
  };
}
export interface UserCredentials {
  username: IUser['username'];
  password: IUser['password'];
}

/**
 * Entidad que representa un usuario del sistema SIGESTA
 *
 * @description
 * Almacena la información de autenticación y autorización de los usuarios
 * que operan el sistema de gestión de agentes operadores de tecnologías
 * de constatación. Cada usuario está asociado a una persona física y tiene
 * un rol que determina sus permisos en el sistema.
 *
 * @remarks
 * - Extiende de {@link Time} para incluir timestamps de creación y actualización
 * - La contraseña debe ser hasheada antes de almacenarse en la base de datos
 * - El username debe ser único en el sistema
 * - La relación con Person se establece mediante personId
 *
 * @example
 * ```typescript
 * const user = new User();
 * user.id = 1;
 * user.personId = 123;
 * user.username = 'jdoe';
 * user.password = await hashPassword('SecurePass123');
 * user.role = 'operator';
 * user.status = 'active';
 * ```
 *
 * @see {@link Time} - Clase base con timestamps
 * @see {@link CreateUserDto} - DTO para crear usuarios
 * @see {@link UpdateUserDto} - DTO para actualizar usuarios
 *
 * @author Facundo Cachan
 * @version 1.0.0
 * @since 1.0.0
 */
@Entity('User')
export class User extends Time {
  /**
   * Identificador único del usuario
   *
   * @type {number}
   * @description
   * Clave primaria de la tabla User. Se utiliza como identificador
   * único del usuario en todo el sistema.
   *
   * @example 1
   */
  @ApiProperty({
    description: 'Identificador único del usuario',
    type: Number,
    example: 1,
  })
  @Column()
  @PrimaryColumn()
  id: number;

  /**
   * Identificador de la persona asociada al usuario
   *
   * @type {string}
   * @description
   * Clave foránea que referencia a la tabla Person. Establece la relación
   * entre el usuario del sistema y los datos personales de la persona física.
   *
   * @example 123
   */
  @ApiProperty({
    description: 'Identificador de la persona asociada al usuario',
    type: Number,
    example: 123,
  })
  @Column({ unique: true })
  personId: number;

  /**
   * Nombre de usuario para autenticación
   *
   * @type {string}
   * @description
   * Identificador único utilizado para el inicio de sesión.
   * Debe ser único en todo el sistema y tener entre 3 y 50 caracteres.
   *
   * @example 'jdoe'
   */
  @ApiProperty({
    description: 'Nombre de usuario único para autenticación',
    type: String,
    example: 'jdoe',
  })
  @Column()
  username: string;

  /**
   * Contraseña hasheada del usuario
   *
   * @type {string}
   * @description
   * Contraseña del usuario almacenada en formato hash.
   * NUNCA debe almacenarse en texto plano. Se recomienda usar
   * bcrypt o argon2 para el hashing.
   *
   * @example '$2b$10$...' (hash bcrypt)
   */
  @ApiProperty({
    description: 'Contraseña hasheada del usuario',
    type: String,
    example: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  })
  @Column()
  password: string;

  /**
   * Rol del usuario en el sistema
   *
   * @type {string}
   * @description
   * Define el nivel de permisos y acceso del usuario en el sistema.
   * Valores comunes: 'admin', 'operator', 'viewer'.
   * Determina qué acciones puede realizar el usuario.
   *
   * @example 'operator'
   */
  @ApiProperty({
    description: 'Rol del usuario en el sistema (determina permisos)',
    type: String,
    example: 'operator',
    enum: ['admin', 'operator', 'viewer'],
  })
  @Column()
  role: string;

  /**
   * Estado actual del usuario
   *
   * @type {string}
   * @description
   * Indica si el usuario está activo y puede acceder al sistema.
   * Valores comunes: 'active', 'inactive', 'suspended'.
   * Solo usuarios con status 'active' pueden iniciar sesión.
   *
   * @example 'active'
   */
  @ApiProperty({
    description: 'Estado actual del usuario',
    type: Number,
    example: 1,
    enum: [1, 0],
  })
  @Column()
  status: number;
}
