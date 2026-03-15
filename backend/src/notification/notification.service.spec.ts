import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';

const mockNotif = {
  id: 'n1', userId: 'u1', type: 'system',
  title: 'Test', message: 'Test msg', isRead: false,
  createdAt: new Date(),
};

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      notification: {
        findMany: jest.fn().mockResolvedValue([mockNotif]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(mockNotif),
        updateMany: jest.fn(),
      },
      contract: { findMany: jest.fn().mockResolvedValue([]) },
      user: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  describe('findAll', () => {
    it('should return paginated notifications', async () => {
      const result = await service.findAll('u1', {});
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      const result = await service.getUnreadCount('u1');
      expect(result.data.unreadCount).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const result = await service.markAsRead('n1', 'u1');
      expect(result.success).toBe(true);
      expect(prisma.notification.updateMany).toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read', async () => {
      const result = await service.markAllAsRead('u1');
      expect(result.success).toBe(true);
    });
  });

  describe('createNotification', () => {
    it('should create notification', async () => {
      const result = await service.createNotification({
        userId: 'u1', type: 'system', title: 'Test', message: 'msg',
      });
      expect(result.id).toBe('n1');
    });
  });

  describe('checkContractExpiry', () => {
    it('should return check results', async () => {
      const result = await service.checkContractExpiry();
      expect(result.checked).toBe(0);
    });
  });
});
