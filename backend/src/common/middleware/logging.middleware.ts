import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip } = req;
    const userId = (req as any).user?.id || 'anonymous';

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const level = statusCode >= 400 ? 'warn' : 'log';

      this.logger[level](
        `${method} ${originalUrl} ${statusCode} ${duration}ms — user:${userId} ip:${ip}`,
      );
    });

    next();
  }
}
