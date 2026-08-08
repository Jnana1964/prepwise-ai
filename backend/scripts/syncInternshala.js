// Manual one-off run: `node scripts/syncInternshala.js`
// Useful the first time you set this up, so you can see real results in
// the `jobs` table without waiting for the scheduled sync in server.js.
import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { syncDatabase, sequelize } from '../models/index.js';
import { syncInternshala } from '../services/internshalaScraper.js';

async function run() {
  await connectDB();
  await syncDatabase();
  const summary = await syncInternshala();
  console.log(JSON.stringify(summary, null, 2));
  await sequelize.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
