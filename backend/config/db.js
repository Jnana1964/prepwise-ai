import { Sequelize } from 'sequelize';

// Single database for the whole app - MySQL.
// Tests use an in-memory SQLite database so the test suite
// does not require a live MySQL server.
export function buildSequelize() {
  if (process.env.NODE_ENV === 'test') {
    return new Sequelize('sqlite::memory:', {
      logging: false
    });
  }

  return new Sequelize(
    process.env.DB_NAME || process.env.MYSQLDATABASE || 'prepwise_ai',
    process.env.DB_USER || process.env.MYSQLUSER || 'root',
    process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    {
      host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
      port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
      dialect: 'mysql',
      logging: false
    }
  );
}

export const sequelize = buildSequelize();

export async function connectDB() {
  await sequelize.authenticate();

  console.log(
    `MySQL connected (${
      process.env.NODE_ENV === 'test'
        ? 'sqlite:memory test mode'
        : process.env.DB_NAME || process.env.MYSQLDATABASE
    })`
  );
}