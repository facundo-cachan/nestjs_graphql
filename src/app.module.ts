import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CallHandler, ExecutionContext, Logger, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Observable } from 'rxjs';

import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { UsersModule } from './modules/users/user.module';
import { AuditInterceptor, AuditService } from './auth';
import { upperDirectiveTransformer } from './common/directives/upper-case.directive';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USER', 'root'),
        password: configService.get<string>('DB_PASSWORD', '1q2w3e'),
        database: configService.get<string>('DB_DB', 'sigesta-backend'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Conditionally register AuditInterceptor only in production
    {
      provide: APP_INTERCEPTOR,
      useFactory: (
        configService: ConfigService,
        auditService: AuditService,
      ) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        const isDevelopment = nodeEnv === 'development';

        if (isDevelopment) {
          console.log(
            '🔕 [AppModule] AuditInterceptor DISABLED (development mode)',
          );
          // Return a no-op interceptor in development
          return {
            intercept: (
              _context: ExecutionContext,
              next: CallHandler,
            ): Observable<unknown> => next.handle(),
          };
        }

        Logger.log('📝 [AppModule] AuditInterceptor ENABLED (production mode)');
        return new AuditInterceptor(auditService);
      },
      inject: [ConfigService, AuditService],
    },
  ],
})
export class AppModule {}
