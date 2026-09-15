import { Sequelize } from 'sequelize';

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
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
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
