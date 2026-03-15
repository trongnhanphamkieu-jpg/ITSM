import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FileController } from './file.controller';
import { PrismaService } from '../prisma/prisma.service';

const mockFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'report.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  size: 2048,
  filename: 'uuid-123.pdf',
  destination: '/uploads',
  path: '/uploads/uuid-123.pdf',
  buffer: Buffer.from(''),
  stream: null as any,
};

describe('FileController', () => {
  let controller: FileController;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      fileUpload: {
        create: jest.fn().mockImplementation(({ data }) => ({
          id: 'db-uuid-1',
          ...data,
          createdAt: new Date(),
        })),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();

    controller = module.get<FileController>(FileController);
  });

  it('should upload file and create DB record', async () => {
    const req = { user: { id: 'user-1' } };
    const result = await controller.upload(mockFile, req);
    expect(result.success).toBe(true);
    expect(result.data.id).toBe('db-uuid-1');
    expect(result.data.fileName).toBe('report.pdf');
    expect(result.data.mimeType).toBe('application/pdf');
    expect(prisma.fileUpload.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fileName: 'report.pdf',
        fileSize: 2048,
        mimeType: 'application/pdf',
        storageKey: 'uuid-123.pdf',
        uploadedById: 'user-1',
      }),
    });
  });

  it('should throw BadRequestException when no file', async () => {
    const req = { user: { id: 'user-1' } };
    await expect(controller.upload(undefined as any, req)).rejects.toThrow(
      BadRequestException,
    );
  });
});
