import { Injectable } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './user.entity';

@ApiTags('User')
@ApiBearerAuth() // ✅ Indica a Swagger que estos endpoints requieren JWT
// @UseGuards(JwtAuthGuard)

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor() {
    this.seed();
  }

  @ApiOperation({ summary: 'Seed users' })
  @ApiResponse({ status: 200, description: 'Users seeded successfully' })
  async seed(): Promise<User[]> {
    return Promise.all(
      Array.from({ length: 10 }, () =>
        this.create({
          id: Math.floor(Math.random() * 1000000),
          personId: Math.floor(Math.random() * 1000000),
          username: faker.internet.username(),
          password: faker.internet.password(),
          role: faker.helpers.arrayElement(['admin', 'operator', 'viewer']),
          status: 1,
        }),
      ),
    );
  }

  @ApiOperation({ summary: 'Find one user' })
  @ApiResponse({ status: 200, description: 'User found successfully' })
  findOne(
    criteria: number | Partial<User> | { where: Partial<User> },
  ): Promise<User | null> {
    let searchParams: Partial<User>;

    if (typeof criteria === 'number') {
      searchParams = { id: criteria };
    } else if (criteria && 'where' in criteria) {
      searchParams = criteria.where;
    } else {
      searchParams = criteria;
    }

    const user = this.users.find((user) => {
      return Object.entries(searchParams).every(
        ([key, value]) => user[key] === value,
      );
    });

    return Promise.resolve(user || null);
  }

  @ApiOperation({ summary: 'Find all users' })
  @ApiResponse({ status: 200, description: 'Users found successfully' })
  findAll(): Promise<User[]> {
    return Promise.resolve(this.users);
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 200, description: 'User created successfully' })
  async create(createUserInput: CreateUserInput): Promise<User> {
    const newUser: User = {
      ...createUserInput,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Si la contraseña no está hasheada (pasa en el seed), la hasheamos
    if (newUser.password && !newUser.password.startsWith('$2b$')) {
      newUser.password = await bcrypt.hash(newUser.password, 10);
    }

    this.users.push(newUser);
    return newUser;
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(id: number, updateUserInput: UpdateUserInput): Promise<User | null> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex > -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updateUserInput };
      return Promise.resolve(this.users[userIndex]);
    }
    return Promise.resolve(null);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  delete(id: number): Promise<User | null> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex > -1) {
      const removedUser = this.users[userIndex];
      this.users.splice(userIndex, 1);
      return Promise.resolve(removedUser);
    }
    return Promise.resolve(null);
  }
}
