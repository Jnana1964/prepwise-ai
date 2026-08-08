import request from 'supertest';
import { app, createUser } from './helpers.js';

describe('Applications API', () => {
  test('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/applications');
    expect(res.status).toBe(401);
  });

  test('rejects creation with missing required fields', async () => {
    const { token } = await createUser();
    const res = await request(app).post('/api/applications').set('Authorization', `Bearer ${token}`).send({ company: 'Google' });
    expect(res.status).toBe(400);
  });

  test('creates and lists an application for the authenticated user', async () => {
    const { token } = await createUser();
    const create = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({ company: 'Google', role: 'Frontend Intern', status: 'applied', matchPercent: 92 });
    expect(create.status).toBe(201);

    const list = await request(app).get('/api/applications').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.applications).toHaveLength(1);
    expect(list.body.applications[0].company).toBe('Google');
  });

  test('one user cannot see, update, or delete another user\'s applications', async () => {
    const userA = await createUser({ email: 'ownerA@example.com' });
    const userB = await createUser({ email: 'ownerB@example.com' });

    const created = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ company: 'Amazon', role: 'SDE Intern' });
    const appId = created.body.id;

    const listAsB = await request(app).get('/api/applications').set('Authorization', `Bearer ${userB.token}`);
    expect(listAsB.body.applications.find((a) => a.id === appId)).toBeUndefined();

    const updateAsB = await request(app)
      .patch(`/api/applications/${appId}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ status: 'offered' });
    expect(updateAsB.status).toBe(404);

    const deleteAsB = await request(app).delete(`/api/applications/${appId}`).set('Authorization', `Bearer ${userB.token}`);
    expect(deleteAsB.status).toBe(404);
  });

  test('owner can update status and the change persists', async () => {
    const { token } = await createUser();
    const created = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({ company: 'Microsoft', role: 'SDE Intern', status: 'applied' });

    const update = await request(app)
      .patch(`/api/applications/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'interview' });
    expect(update.status).toBe(200);
    expect(update.body.status).toBe('interview');
  });

  test('deleting a nonexistent application returns 404, not 200', async () => {
    const { token } = await createUser();
    const res = await request(app).delete('/api/applications/999999').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
