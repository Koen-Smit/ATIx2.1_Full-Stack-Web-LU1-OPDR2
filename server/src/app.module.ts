import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RepositoryModule } from './infrastructure/repository.module';
import { AuthModule } from './auth/auth.module';
import { UserService } from './application/services/user.service';
import { ModuleService } from './application/services/module.service';
import { UserController } from './presentation/controllers/user.controller';
import { ModuleController } from './presentation/controllers/module.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RepositoryModule,
    AuthModule,
  ],
  controllers: [AppController, UserController, ModuleController],
  providers: [
    AppService,
    UserService,
    ModuleService,
  ],
})
export class AppModule {}
