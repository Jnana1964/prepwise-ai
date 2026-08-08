import request from 'supertest';
import { app, createUser } from './helpers.js';

describe('POST /api/auth/signup', () => {
  test('rejects a signup missing required fields', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  test('rejects a password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/signup').send({ name: 'A', email: 'short@b.com', password: '123' });
    expect(res.status).toBe(400);
  });

  test('creates a user and returns a usable token', async () => {
    const { res } = await createUser({ email: 'unique1@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe('unique1@example.com');
  });

  test('rejects a duplicate email', async () => {
    await createUser({ email: 'dupe@example.com' });
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'B', email: 'dupe@example.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  test('normalizes email case for duplicate detection', async () => {
    await createUser({ email: 'CaseTest@Example.com' });
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'B', email: 'casetest@example.com', password: 'password123' });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  test('rejects a wrong password', async () => {
    await createUser({ email: 'login1@example.com', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ email: 'login1@example.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  test('rejects a nonexistent email without leaking whether the account exists', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'password123' });
    expect(res.status).toBe(401);
    expect(res.body.message).not.toMatch(/no user found|does not exist/i);
  });

  test('logs in successfully with correct credentials', async () => {
    await createUser({ email: 'login2@example.com', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ email: 'login2@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });
});

describe('GET /api/auth/me', () => {
  test('rejects a request with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('rejects a garbage/invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  test('returns the correct user for a valid token', async () => {
    const { token, user } = await createUser({ name: 'Me Test', email: 'metest@example.com' });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(user.id);
    expect(res.body.user.name).toBe('Me Test');
  });
});
