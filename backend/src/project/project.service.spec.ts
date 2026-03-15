import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectService } from './project.service';
import { PrismaService } from '../prisma/prisma.service';

const mockProject = {
  id: 'pr1', code: 'DA-001', name: 'Test Project',
  department: 'IT', status: 'active', description: 'desc',
  startDate: new Date(), endDate: null, notes: null,
  createdById: 'u1', createdBy: { id: 'u1', fullName: 'Admin' },
};

describe('ProjectService', () => {
  let service: ProjectService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      project: {
        findMany: jest.fn().mockResolvedValue([mockProject]),
        findUnique: jest.fn(),
        create: jest.fn().mockResolvedValue(mockProject),
        update: jest.fn().mockResolvedValue(mockProject),
        delete: jest.fn(),
      },
      budgetItem: {
        findMany: jest.fn().mockResolvedValue([{ totalPrice: 100000 }]),
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'bi1' }),
        delete: jest.fn(),
      },
      budgetCategory: {
        findFirst: jest.fn().mockResolvedValue({ id: 'bc1' }),
        create: jest.fn(),
      },
      budgetPlan: { findFirst: jest.fn() },
      actualCost: {
        findMany: jest.fn().mockResolvedValue([{ amount: 50000, costDate: new Date() }]),
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'ac1' }),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  describe('findAll', () => {
    it('should return projects list', async () => {
      const result = await service.findAll({});
      expect(result).toHaveLength(1);
    });

    it('should filter by status', async () => {
      await service.findAll({ status: 'active' });
      expect(prisma.project.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return project by id', async () => {
      prisma.project.findUnique.mockResolvedValue(mockProject);
      const result = await service.findOne('pr1');
      expect(result.id).toBe('pr1');
    });

    it('should throw NotFoundException', async () => {
      prisma.project.findUnique.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create project', async () => {
      const result = await service.create({ code: 'DA-002', name: 'New' }, 'u1');
      expect(result.id).toBe('pr1');
    });
  });

  describe('update', () => {
    it('should update project', async () => {
      prisma.project.findUnique.mockResolvedValue(mockProject);
      const result = await service.update('pr1', { name: 'Updated' });
      expect(result.id).toBe('pr1');
    });
  });

  describe('remove', () => {
    it('should delete project', async () => {
      prisma.project.findUnique.mockResolvedValue(mockProject);
      await service.remove('pr1');
      expect(prisma.project.delete).toHaveBeenCalled();
    });
  });

  describe('budgetSummary', () => {
    it('should calculate budget summary', async () => {
      prisma.project.findUnique.mockResolvedValue(mockProject);
      const result = await service.budgetSummary('pr1');
      expect(result.plannedBudget).toBe(100000);
      expect(result.actualCost).toBe(50000);
      expect(result.remaining).toBe(50000);
    });
  });

  describe('budgetOverview', () => {
    it('should return overview of all active projects', async () => {
      prisma.project.findUnique.mockResolvedValue(mockProject);
      const result = await service.budgetOverview();
      expect(result.projects).toHaveLength(1);
      expect(result.totals).toBeDefined();
    });
  });
});
