import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Cost & Dashboard (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let costId: string;

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

  describe('Actual Costs', () => {
    it('POST /api/costs - create cost', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/costs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'E2E Test Cost',
          amount: 1000000,
          costDate: '2026-03-15',
          categoryName: 'Hardware',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      costId = res.body.data.id;
    });

    it('GET /api/costs - list costs', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/costs')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/costs/categories - get categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/costs/categories')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('DELETE /api/costs/:id - delete cost', async () => {
      await request(app.getHttpServer())
        .delete(`/api/costs/${costId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('Dashboard', () => {
    it('GET /api/dashboard - get summary', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalBudget).toBeDefined();
      expect(res.body.data.totalSpent).toBeDefined();
      expect(res.body.data.planCount).toBeDefined();
    });

    it('GET /api/dashboard?year=2026 - filter by year', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard?year=2026')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.filterLabel).toContain('2026');
    });
  });
});
