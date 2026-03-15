import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMasterDataItemDto,
  UpdateMasterDataItemDto,
  CreateMasterCategoryDto,
  UpdateMasterCategoryDto,
} from './dto/master-data.dto';

@Injectable()
export class MasterDataService {
  constructor(private prisma: PrismaService) {}

  // ── Master Data Items ──

  async findAllItems(params: {
    type?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { type, isActive, search, page = 1, limit = 100 } = params;
    const where: Record<string, unknown> = {};

    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.masterDataItem.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.masterDataItem.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findItemById(id: string) {
    const item = await this.prisma.masterDataItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Master data item not found');
    return item;
  }

  async findItemsByType(type: string) {
    return this.prisma.masterDataItem.findMany({
      where: { type, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async getAvailableTypes() {
    const types = await this.prisma.masterDataItem.groupBy({
      by: ['type'],
      _count: { id: true },
    });
    return types.map((t) => ({ type: t.type, count: t._count.id }));
  }

  async createItem(dto: CreateMasterDataItemDto) {
    const existing = await this.prisma.masterDataItem.findUnique({
      where: { type_code: { type: dto.type, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException(`Item with code "${dto.code}" already exists for type "${dto.type}"`);
    }

    return this.prisma.masterDataItem.create({ data: dto });
  }

  async updateItem(id: string, dto: UpdateMasterDataItemDto) {
    await this.findItemById(id);
    return this.prisma.masterDataItem.update({ where: { id }, data: dto });
  }

  async removeItem(id: string) {
    await this.findItemById(id);
    return this.prisma.masterDataItem.delete({ where: { id } });
  }

  // ── Master Categories (Tree) ──

  async findAllCategories(params: {
    type?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const { type, isActive, search } = params;
    const where: Record<string, unknown> = {};

    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.masterCategory.findMany({
      where,
      include: { children: { include: { children: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findCategoryTree(type: string) {
    const roots = await this.prisma.masterCategory.findMany({
      where: { type, parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: { where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }] },
          },
          orderBy: [{ sortOrder: 'asc' }],
        },
      },
      orderBy: [{ sortOrder: 'asc' }],
    });
    return roots;
  }

  async findCategoryById(id: string) {
    const cat = await this.prisma.masterCategory.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });
    if (!cat) throw new NotFoundException('Master category not found');
    return cat;
  }

  async createCategory(dto: CreateMasterCategoryDto) {
    const existing = await this.prisma.masterCategory.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Category with code "${dto.code}" already exists`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.masterCategory.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
    }

    return this.prisma.masterCategory.create({
      data: dto,
      include: { parent: true },
    });
  }

  async updateCategory(id: string, dto: UpdateMasterCategoryDto) {
    await this.findCategoryById(id);

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new ConflictException('Category cannot be its own parent');
      }
      const parent = await this.prisma.masterCategory.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
    }

    return this.prisma.masterCategory.update({
      where: { id },
      data: dto,
      include: { parent: true, children: true },
    });
  }

  async removeCategory(id: string) {
    const cat = await this.findCategoryById(id);

    const childCount = await this.prisma.masterCategory.count({
      where: { parentId: id },
    });
    if (childCount > 0) {
      throw new ConflictException(
        `Cannot delete category "${cat.name}": has ${childCount} child categories. Remove children first.`,
      );
    }

    return this.prisma.masterCategory.delete({ where: { id } });
  }

  // ── Seed default data ──

  async seedDefaults() {
    const types = [
      { type: 'department', items: ['Phòng IT', 'Phòng Kế toán', 'Phòng Nhân sự', 'Ban Giám đốc', 'Phòng Kinh doanh'] },
      { type: 'contract_type', items: ['Bảo trì', 'Thuê ngoài', 'Mua sắm', 'Tư vấn', 'SaaS'] },
      { type: 'environment', items: ['Production', 'Staging', 'Development', 'Testing'] },
      { type: 'location', items: ['Trụ sở chính', 'Chi nhánh 1', 'Chi nhánh 2', 'Data Center'] },
      { type: 'vehicle_type', items: ['Sedan', 'SUV', 'Pickup', 'Van', 'Xe tải'] },
      { type: 'fuel_type', items: ['Xăng', 'Dầu', 'Điện', 'Hybrid'] },
      { type: 'maintenance_type', items: ['Bảo dưỡng định kỳ', 'Sửa chữa', 'Nâng cấp', 'Thay thế linh kiện'] },
      { type: 'payment_method', items: ['Chuyển khoản', 'Tiền mặt', 'Thẻ tín dụng', 'LC'] },
      { type: 'unit_of_measure', items: ['Cái', 'Bộ', 'Gói', 'Tháng', 'Năm', 'Người', 'License'] },
      { type: 'asset_category', items: ['Máy tính', 'Màn hình', 'Máy in', 'Thiết bị mạng', 'Server', 'Lưu trữ'] },
    ];

    let created = 0;
    for (const { type, items } of types) {
      for (let i = 0; i < items.length; i++) {
        const code = `${type}_${(i + 1).toString().padStart(2, '0')}`;
        const existing = await this.prisma.masterDataItem.findUnique({
          where: { type_code: { type, code } },
        });
        if (!existing) {
          await this.prisma.masterDataItem.create({
            data: { type, code, name: items[i], sortOrder: i + 1 },
          });
          created++;
        }
      }
    }

    // Seed default categories
    const categories = [
      { code: 'CAT_BUDGET', name: 'Ngân sách', type: 'budget', children: [
        { code: 'CAT_BUD_HW', name: 'Phần cứng' },
        { code: 'CAT_BUD_SW', name: 'Phần mềm' },
        { code: 'CAT_BUD_SVC', name: 'Dịch vụ' },
        { code: 'CAT_BUD_HR', name: 'Nhân sự IT' },
        { code: 'CAT_BUD_INFRA', name: 'Hạ tầng' },
      ]},
      { code: 'CAT_COST', name: 'Chi phí', type: 'cost', children: [
        { code: 'CAT_CST_HW', name: 'Phần cứng' },
        { code: 'CAT_CST_SW', name: 'Phần mềm' },
        { code: 'CAT_CST_SVC', name: 'Dịch vụ' },
        { code: 'CAT_CST_MAINT', name: 'Bảo trì' },
        { code: 'CAT_CST_OTHER', name: 'Khác' },
      ]},
      { code: 'CAT_ASSET', name: 'Tài sản', type: 'asset', children: [
        { code: 'CAT_AST_PC', name: 'Máy tính' },
        { code: 'CAT_AST_NET', name: 'Thiết bị mạng' },
        { code: 'CAT_AST_PRINT', name: 'Máy in' },
        { code: 'CAT_AST_MON', name: 'Màn hình' },
        { code: 'CAT_AST_SRV', name: 'Server' },
      ]},
    ];

    for (const cat of categories) {
      let parent = await this.prisma.masterCategory.findUnique({
        where: { code: cat.code },
      });
      if (!parent) {
        parent = await this.prisma.masterCategory.create({
          data: { code: cat.code, name: cat.name, type: cat.type },
        });
        created++;
      }
      if (cat.children) {
        for (let i = 0; i < cat.children.length; i++) {
          const child = cat.children[i];
          const existing = await this.prisma.masterCategory.findUnique({
            where: { code: child.code },
          });
          if (!existing) {
            await this.prisma.masterCategory.create({
              data: {
                code: child.code,
                name: child.name,
                type: cat.type,
                parentId: parent.id,
                sortOrder: i + 1,
              },
            });
            created++;
          }
        }
      }
    }

    return { created, message: `Seeded ${created} master data records` };
  }
}
