import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// One row per completed Skill Builder practice session - separate from
// SkillProgress, which only keeps a running cumulative counter that gets
// overwritten. This is what powers Track Record: a real, permanent log of
// every session with a full question-by-question breakdown, so a user can
// come back later and study exactly what they got wrong.
const SkillAttempt = sequelize.define(
  'SkillAttempt',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    category: {
      type: DataTypes.ENUM('mcq', 'coding', 'aptitude', 'hr', 'company'),
      allowNull: false
    },
    scorePct: { type: DataTypes.INTEGER, allowNull: false },
    correctCount: { type: DataTypes.INTEGER, allowNull: false },
    totalCount: { type: DataTypes.INTEGER, allowNull: false },
    // [{ questionId, prompt, correct, given, correctAnswer }] for mcq/aptitude
    // [{ questionId, prompt, correct: allPassed, testsPassed, testsTotal }] for coding
    // [{ questionId, prompt, correct: answered, answer }] for hr/company
    questionResults: { type: DataTypes.JSON, defaultValue: [] }
  },
  { tableName: 'skill_attempts', timestamps: true }
);

export default SkillAttempt;