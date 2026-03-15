import { LoggingMiddleware } from './logging.middleware';
import { Logger } from '@nestjs/common';

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    middleware = new LoggingMiddleware();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('should log successful requests with status and duration', (done) => {
    const req: any = { method: 'GET', originalUrl: '/api/v1/dashboard', ip: '127.0.0.1' };
    const res: any = { statusCode: 200, on: jest.fn((event, cb) => { if (event === 'finish') cb(); }) };
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('GET /api/v1/dashboard 200'));
    done();
  });

  it('should log 4xx errors with warn level', (done) => {
    const req: any = { method: 'POST', originalUrl: '/api/v1/vendors', ip: '10.0.0.1', user: { id: 'u1' } };
    const res: any = { statusCode: 403, on: jest.fn((event, cb) => { if (event === 'finish') cb(); }) };
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('403'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('user:u1'));
    done();
  });

  it('should show anonymous for unauthenticated requests', (done) => {
    const req: any = { method: 'POST', originalUrl: '/api/v1/auth/login', ip: '10.0.0.1' };
    const res: any = { statusCode: 200, on: jest.fn((event, cb) => { if (event === 'finish') cb(); }) };
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('user:anonymous'));
    done();
  });
});
