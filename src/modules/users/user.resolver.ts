import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';

import { User } from './user.entity';
import { UsersService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User)
  async user(@Args('id') id: number): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.usersService.create(createUserInput);
  }

  @Mutation(() => User)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User | null> {
    return this.usersService.update(updateUserInput.id!, updateUserInput);
  }

  @Mutation(() => User)
  async deleteUser(@Args('id') id: number): Promise<User | null> {
    return this.usersService.delete(id);
  }
}
