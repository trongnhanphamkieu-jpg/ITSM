import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

const AUDIT_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const SKIP_PATHS = ['/api/v1/auth/', '/api/v1/activity-log'];

function extractModule(path: string): string {
  const clean = path.replace('/api/v1/', '');
  const segment = clean.split('/')[0];
  return segment.replace(/-/g, '_');
}

function methodToAction(method: string): string {
  switch (method) {
    case 'POST': return 'create';
    case 'PUT': case 'PATCH': return 'update';
    case 'DELETE': return 'delete';
    default: return method.toLowerCase();
  }
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body } = req;

    if (!AUDIT_METHODS.includes(method)) return next.handle();
    if (SKIP_PATHS.some((p) => url.startsWith(p))) return next.handle();

    const module = extractModule(url);
    const action = methodToAction(method);
    const userId = req.user?.id;

    return next.handle().pipe(
      tap((responseData) => {
        if (!userId) return;

        const entityId = responseData?.id || req.params?.id || req.params?.itemId;
        const entityType = module;

        this.prisma.auditLog
          .create({
            data: {
              userId,
              module,
              action,
              entityType,
              entityId: entityId || undefined,
              newData: action === 'delete' ? undefined : (body || undefined),
              oldData: undefined,
              ipAddress: req.ip || req.connection?.remoteAddress || null,
              userAgent: req.headers?.['user-agent']?.substring(0, 500) || null,
            },
          })
          .catch((err) => {
            console.error('Audit log failed:', err.message);
          });
      }),
    );
  }
}
