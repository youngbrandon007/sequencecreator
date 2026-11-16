import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('SessionsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates, fetches, and deletes a session', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/sessions')
      .send({ title: 'Test show' })
      .expect(201);

    expect(created.body.code).toMatch(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
    expect(created.body.title).toBe('Test show');

    await request(app.getHttpServer())
      .get(`/api/sessions/${created.body.code}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.code).toBe(created.body.code);
      });

    await request(app.getHttpServer())
      .delete(`/api/sessions/${created.body.code}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/api/sessions/${created.body.code}`)
      .expect(404);
  });

  it('health returns ok', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });
});
