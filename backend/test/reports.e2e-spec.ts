import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Reports (e2e)', () => {
  let app: INestApplication;
  let token: string;

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

  it('GET /api/reports/budget-summary?year=2026', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/reports/budget-summary?year=2026')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.year).toBe(2026);
    expect(res.body.totalBudget).toBeDefined();
  });

  it('GET /api/reports/cost-comparison?year=2026', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/reports/cost-comparison?year=2026')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.months).toHaveLength(12);
  });

  it('GET /api/reports/asset-overview', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/reports/asset-overview')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.totalAssets).toBeDefined();
    expect(res.body.breakdown).toBeDefined();
  });

  it('GET /api/reports/project-budget?year=2026', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/reports/project-budget?year=2026')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
