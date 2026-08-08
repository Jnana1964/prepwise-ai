import { syncDatabase, sequelize } from '../models/index.js';

beforeAll(async () => {
  await syncDatabase({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
