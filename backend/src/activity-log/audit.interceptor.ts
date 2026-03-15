import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from, switchMap, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

const AUDIT_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const SKIP_PATHS = ['/api/v1/auth/', '/api/v1/activity-log'];

const MODEL_MAP: Record<string, string> = {
  vendors: 'vendor',
  contracts: 'contract',
  budget_plans: 'budgetPlan',
  actual_costs: 'actualCost',
  projects: 'project',
  cost_forecasts: 'costForecast',
  vehicles: 'vehicle',
  vehicle_costs: 'vehicleVariableCost',
  vehicle_subscriptions: 'vehicleServiceSubscription',
  vehicle_services: 'vehicleService',
  'soft_inventory/email_accounts': 'emailAccount',
  'soft_inventory/domains': 'domain',
  'soft_inventory/vps_servers': 'vpsServer',
  'soft_inventory/software_licenses': 'softwareLicense',
  'soft_inventory/ssl_certificates': 'sslCertificate',
  'hard_inventory/hardware_assets': 'hardwareAsset',
  'hard_inventory/infra_resources': 'infraResource',
  'hard_inventory/ip_addresses': 'ipAddress',
};

function extractModule(path: string): string {
  const clean = path.replace('/api/v1/', '');
  const segment = clean.split('/')[0];
  return segment.replace(/-/g, '_');
}

function extractFullModule(path: string): string {
  const clean = path.replace('/api/v1/', '').replace(/-/g, '_');
  // Handle nested paths like soft_inventory/email_accounts
  const parts = clean.split('/');
  if (parts.length >= 2 && (parts[0] === 'soft_inventory' || parts[0] === 'hard_inventory')) {
    return `${parts[0]}/${parts[1]}`;
  }
  return parts[0];
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
    const fullModule = extractFullModule(url);
    const action = methodToAction(method);
    const userId = req.user?.id;
    const entityId = req.params?.id || req.params?.itemId;

    // Capture old data for update/delete operations
    const oldDataPromise = (action === 'update' || action === 'delete') && entityId
      ? this.fetchOldData(fullModule, entityId)
      : Promise.resolve(undefined);

    return from(oldDataPromise).pipe(
      switchMap((oldData) =>
        next.handle().pipe(
          tap((responseData) => {
            if (!userId) return;

            const resolvedEntityId = responseData?.id || entityId;
            const entityType = module;

            this.prisma.auditLog
              .create({
                data: {
                  userId,
                  module,
                  action,
                  entityType,
                  entityId: resolvedEntityId || undefined,
                  newData: action === 'delete' ? undefined : (body || undefined),
                  oldData: oldData || undefined,
                  ipAddress: req.ip || req.connection?.remoteAddress || null,
                  userAgent: req.headers?.['user-agent']?.substring(0, 500) || null,
                },
              })
              .catch((err) => {
                console.error('Audit log failed:', err.message);
              });
          }),
        ),
      ),
    );
  }

  private async fetchOldData(fullModule: string, entityId: string): Promise<Record<string, any> | undefined> {
    try {
      const modelName = MODEL_MAP[fullModule];
      if (!modelName || !(this.prisma as any)[modelName]) return undefined;

      const record = await (this.prisma as any)[modelName].findUnique({
        where: { id: entityId },
      });
      return record || undefined;
    } catch {
      return undefined;
    }
  }
}
