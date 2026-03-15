import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Vendors & Activity Log (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let vendorId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@itms.local', password: 'Admin@123' });
    token = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Vendors', () => {
    it('POST /api/vendors - create vendor', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/vendors')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'E2E Vendor', email: 'e2e@vendor.com', phone: '0901234567' })
        .expect(201);

      expect(res.body.success).toBe(true);
      vendorId = res.body.data.id;
    });

    it('GET /api/vendors - list vendors', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/vendors')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/vendors/:id - get vendor', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/vendors/${vendorId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('E2E Vendor');
    });

    it('PUT /api/vendors/:id/deactivate - deactivate vendor', async () => {
      await request(app.getHttpServer())
        .put(`/api/vendors/${vendorId}/deactivate`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('Activity Log', () => {
    it('GET /api/activity-log - list logs', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/activity-log')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.total).toBeDefined();
    });

    it('GET /api/activity-log/stats - get stats', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/activity-log/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.totalLogs).toBeDefined();
    });

    it('GET /api/activity-log/modules - get modules', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/activity-log/modules')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
