import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class SpaController {
  @Get('*')
  serveAngularApp(@Res() res: Response): void {
    // Only serve SPA in production
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(join(__dirname, '..', 'public', 'index.html'));
    } else {
      res.status(404).json({ message: 'SPA fallback only available in production' });
    }
  }
}