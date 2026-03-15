import { RolesGuard, ROLES_KEY } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const mockContext = (role: string): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: '1', role } }),
      }),
    }) as unknown as ExecutionContext;

  it('should allow access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(mockContext('staff'))).toBe(true);
  });

  it('should allow admin to access admin-required endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'manager']);
    expect(guard.canActivate(mockContext('admin'))).toBe(true);
  });

  it('should allow manager to access admin/manager endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'manager']);
    expect(guard.canActivate(mockContext('manager'))).toBe(true);
  });

  it('should deny staff from admin-only endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    expect(() => guard.canActivate(mockContext('staff'))).toThrow(ForbiddenException);
  });

  it('should deny viewer from write endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'manager', 'staff']);
    expect(() => guard.canActivate(mockContext('viewer'))).toThrow(ForbiddenException);
  });

  it('should deny finance from delete endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'manager']);
    expect(() => guard.canActivate(mockContext('finance'))).toThrow(ForbiddenException);
  });

  it('should allow viewer to access read-all endpoint', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'manager', 'staff', 'finance', 'viewer']);
    expect(guard.canActivate(mockContext('viewer'))).toBe(true);
  });
});
