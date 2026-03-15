import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Budget Workflow (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let planId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@itms.local', password: 'Admin@123' });
    token = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Budget Plans CRUD', () => {
    it('POST /api/budget/plans - create plan', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/budget/plans')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'E2E Test Plan', year: 2026, description: 'e2e test' })
        .expect(201);

      expect(res.body.success).toBe(true);
      planId = res.body.data.id;
    });

    it('GET /api/budget/plans - list plans', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/budget/plans')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/budget/plans/:id - get plan', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/budget/plans/${planId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('E2E Test Plan');
    });

    it('PUT /api/budget/plans/:id - update plan', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/budget/plans/${planId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'E2E Updated Plan' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('Budget Workflow', () => {
    it('POST /api/budget/plans/:id/submit - submit plan', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/budget/plans/${planId}/submit`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('POST /api/budget/plans/:id/approve - approve plan', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/budget/plans/${planId}/approve`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(res.body.success).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('DELETE /api/budget/plans/:id - delete plan', async () => {
      await request(app.getHttpServer())
        .delete(`/api/budget/plans/${planId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
