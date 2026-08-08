import { Sequelize } from 'sequelize';

// Single database for the whole app - MySQL. Tests swap this for an
// in-memory SQLite instance (see tests/setup.js) so the test suite doesn't
// need a live MySQL server; application code never imports mysql2 directly,
// only through this Sequelize instance.
export function buildSequelize() {
  if (process.env.NODE_ENV === 'test') {
    return new Sequelize('sqlite::memory:', { logging: false });
  }

  return new Sequelize(
    process.env.DB_NAME || 'prepwise_ai',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false
    }
  );
}

export const sequelize = buildSequelize();

export async function connectDB() {
  await sequelize.authenticate();
  console.log(`MySQL connected (${process.env.NODE_ENV === 'test' ? 'sqlite:memory test mode' : process.env.DB_NAME})`);
}
