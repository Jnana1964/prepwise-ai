import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { syncDatabase, Job, sequelize } from '../models/index.js';
import { JOBS_SEED } from '../data/jobsSeed.js';

async function run() {
  await connectDB();
  await syncDatabase();
  await Job.destroy({ where: { source: 'seed' } });
  await Job.bulkCreate(JOBS_SEED);
  console.log(`Seeded ${JOBS_SEED.length} jobs`);
  await sequelize.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
