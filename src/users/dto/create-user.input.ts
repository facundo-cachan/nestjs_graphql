import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  avatar?: string;
}
