import { AuditInterceptor } from './audit.interceptor';
import { PrismaService } from '../prisma/prisma.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      auditLog: { create: jest.fn().mockResolvedValue({}) },
      vendor: { findUnique: jest.fn().mockResolvedValue({ id: 'v1', name: 'Old Vendor' }) },
      actualCost: { findUnique: jest.fn().mockResolvedValue({ id: 'c1', amount: 100 }) },
    };
    interceptor = new AuditInterceptor(prisma as PrismaService);
  });

  const createContext = (method: string, url: string, body?: any, userId?: string, params?: Record<string, string>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          url,
          body,
          user: userId ? { id: userId } : null,
          params: params || {},
          ip: '127.0.0.1',
          headers: { 'user-agent': 'test-agent' },
          connection: { remoteAddress: '127.0.0.1' },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as unknown as ExecutionContext;

  const mockNext: CallHandler = { handle: () => of({ id: 'new-entity' }) };

  it('should skip GET requests', (done) => {
    const ctx = createContext('GET', '/api/v1/vendors', null, 'user-1');
    interceptor.intercept(ctx, mockNext).subscribe(() => {
      expect(prisma.auditLog.create).not.toHaveBeenCalled();
      done();
    });
  });

  it('should skip auth endpoints', (done) => {
    const ctx = createContext('POST', '/api/v1/auth/login', { email: 'test' }, 'user-1');
    interceptor.intercept(ctx, mockNext).subscribe(() => {
      expect(prisma.auditLog.create).not.toHaveBeenCalled();
      done();
    });
  });

  it('should log POST requests with entity ID from response', (done) => {
    const ctx = createContext('POST', '/api/v1/vendors', { name: 'New' }, 'user-1');
    interceptor.intercept(ctx, mockNext).subscribe(() => {
      setTimeout(() => {
        expect(prisma.auditLog.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: 'user-1',
            module: 'vendors',
            action: 'create',
            entityId: 'new-entity',
          }),
        });
        done();
      }, 50);
    });
  });

  it('should capture old data for PATCH requests', (done) => {
    const ctx = createContext('PATCH', '/api/v1/vendors/v1', { name: 'Updated' }, 'user-1', { id: 'v1' });
    interceptor.intercept(ctx, mockNext).subscribe(() => {
      setTimeout(() => {
        expect(prisma.vendor.findUnique).toHaveBeenCalledWith({ where: { id: 'v1' } });
        expect(prisma.auditLog.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            action: 'update',
            oldData: { id: 'v1', name: 'Old Vendor' },
            newData: { name: 'Updated' },
          }),
        });
        done();
      }, 50);
    });
  });

  it('should capture old data for DELETE requests', (done) => {
    const ctx = createContext('DELETE', '/api/v1/vendors/v1', null, 'user-1', { id: 'v1' });
    interceptor.intercept(ctx, mockNext).subscribe(() => {
      setTimeout(() => {
        expect(prisma.vendor.findUnique).toHaveBeenCalledWith({ where: { id: 'v1' } });
        expect(prisma.auditLog.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            action: 'delete',
            oldData: { id: 'v1', name: 'Old Vendor' },
          }),
        });
        done();
      }, 50);
    });
  });

  it('should not crash if user is not authenticated', (done) => {
    const ctx = createContext('POST', '/api/v1/vendors', { name: 'Test' }, undefined);
    interceptor.intercept(ctx, mockNext).subscribe(() => {
      expect(prisma.auditLog.create).not.toHaveBeenCalled();
      done();
    });
  });
});
