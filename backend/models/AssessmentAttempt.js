import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Owned exclusively by assessment.controller.js. Company-specific mock
// assessment attempt history - gates AI Mock Interview. `passThreshold` is
// captured on the row itself (not just read from env at query time) so
// historical attempts stay accurate even if MOCK_ASSESSMENT_PASS_THRESHOLD
// changes later.
const AssessmentAttempt = sequelize.define(
  'AssessmentAttempt',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    companyId: { type: DataTypes.INTEGER, allowNull: true },
    companyName: { type: DataTypes.STRING, allowNull: false },
    score: { type: DataTypes.INTEGER, allowNull: false },
    passThreshold: { type: DataTypes.INTEGER, allowNull: false },
    passed: { type: DataTypes.BOOLEAN, allowNull: false },
    sectionScores: { type: DataTypes.JSON, defaultValue: {} },
    // Per-question breakdown, added for Track Record - see
    // scripts/migrateAssessmentQuestionResults.js for how this column got
    // added to an already-existing table.
    questionResults: { type: DataTypes.JSON, defaultValue: [] }
  },
  { tableName: 'assessment_attempts', timestamps: true }
);

export default AssessmentAttempt;