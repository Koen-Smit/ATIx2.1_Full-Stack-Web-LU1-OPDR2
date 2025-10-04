import { Module } from '@nestjs/common';
import { AuthService } from '../application/services/auth.service';
import { AuthController } from '../presentation/controllers/auth.controller';
import { JwtStrategy } from '../infrastructure/auth/jwt.strategy';
import { RepositoryModule } from '../infrastructure/repository.module';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';

@Module({
  imports: [
    RepositoryModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}