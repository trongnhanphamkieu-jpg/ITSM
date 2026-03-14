import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserRole, UserStatus } from '@prisma/client';

const USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  status: true,
  department: true,
  phone: true,
  avatarUrl: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) throw new NotFoundException('User không tồn tại');

    return { success: true, data: user };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
        role: (dto.role as UserRole) || 'staff',
        department: dto.department,
        phone: dto.phone,
      },
      select: USER_SELECT,
    });

    return { success: true, data: user };
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.role && { role: dto.role as UserRole }),
        ...(dto.department !== undefined && { department: dto.department }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.status && { status: dto.status as UserStatus }),
      },
      select: USER_SELECT,
    });

    return { success: true, data: user };
  }

  async disable(id: string) {
    await this.findOne(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { status: 'inactive' },
      select: USER_SELECT,
    });

    return { success: true, data: user };
  }
}
