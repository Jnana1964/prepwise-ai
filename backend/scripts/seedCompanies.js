import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { syncDatabase, Company, sequelize } from '../models/index.js';
import { COMPANIES_SEED } from '../data/companiesSeed.js';

async function run() {
  await connectDB();
  await syncDatabase();
  for (const c of COMPANIES_SEED) {
    await Company.findOrCreate({ where: { name: c.name }, defaults: c });
  }
  console.log(`Seeded ${COMPANIES_SEED.length} companies`);
  await sequelize.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
