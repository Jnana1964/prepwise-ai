import 'dotenv/config';
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

async function run() {
  const qi = sequelize.getQueryInterface();
  const table = await qi.describeTable('assessment_attempts');
  if (table.questionResults) {
    console.log('questionResults column already exists - nothing to do.');
  } else {
    await qi.addColumn('assessment_attempts', 'questionResults', {
      type: DataTypes.JSON,
      defaultValue: []
    });
    console.log('Added questionResults column to assessment_attempts.');
  }
  await sequelize.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});