import { IUser } from 'src/modules/users/user.entity';

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SsoLoginDto {
  @ApiProperty({
    description: 'JWT Token from SSO Provider',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export interface UserCredentials {
  username: IUser['username'];
  password: IUser['password'];
}
