import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  avatar?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
