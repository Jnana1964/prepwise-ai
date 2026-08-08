import request from 'supertest';
import app from '../server.js';

let counter = 0;

export async function createUser(overrides = {}) {
  counter += 1;
  const payload = {
    name: 'Test User',
    email: `user${counter}-${Date.now()}@example.com`,
    password: 'password123',
    ...overrides
  };
  const res = await request(app).post('/api/auth/signup').send(payload);
  return { token: res.body.token, user: res.body.user, res };
}

export { app };
