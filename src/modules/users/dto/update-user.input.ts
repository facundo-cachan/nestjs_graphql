import { PartialType } from '@nestjs/swagger';

import { CreateUserInput } from './create-user.input';

/**
 * DTO para actualizar usuarios existentes del sistema SIGESTA
 *
 * @description
 * Extiende de {@link CreateUserDto} utilizando `PartialType` de NestJS,
 * lo que hace que todas las propiedades sean opcionales.
 * Esto permite actualizaciones parciales donde solo se envían los campos
 * que se desean modificar, sin necesidad de enviar todos los datos del usuario.
 *
 * @remarks
 * - Todas las propiedades son opcionales para permitir actualizaciones parciales
 * - Las validaciones de {@link CreateUserDto} se aplican solo a los campos enviados
 * - No es necesario enviar todos los campos, solo los que se desean actualizar
 * - Los decoradores de Swagger se heredan automáticamente de CreateUserDto
 *
 * @example
 * Actualizar solo el rol de un usuario:
 * ```typescript
 * const updateData: UpdateUserDto = {
 *   role: 'admin'
 * };
 * ```
 *
 * @example
 * Actualizar múltiples campos:
 * ```typescript
 * const updateData: UpdateUserDto = {
 *   role: 'operator',
 *   status: 'active',
 *   password: 'NewSecurePass456'
 * };
 * ```
 *
 * @example
 * Cambiar el estado del usuario:
 * ```typescript
 * const updateData: UpdateUserDto = {
 *   status: 'inactive'
 * };
 * ```
 *
 * @see {@link CreateUserDto} - DTO base del cual se derivan las propiedades
 * @see {@link User} - Entidad de usuario
 * @see {@link PartialType} - Utilidad de NestJS para hacer propiedades opcionales
 *
 * @author Facundo Cachan
 * @version 1.0.0
 * @since 1.0.0
 */
export class UpdateUserInput extends PartialType(CreateUserInput) {}
