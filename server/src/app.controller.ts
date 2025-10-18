import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('connection-test')
  getConnectionTest(): object {
    return {
      status: 'OK',
      message: 'Database connection is successful',
      timestamp: new Date().toISOString(),
    };
  }

  // Fallback route for Angular routing
  @Get('*')
  serveAngularApp(@Res() res: Response): void {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  }
}
