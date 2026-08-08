import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Owned exclusively by skills.controller.js. Continuously updated - every
// completed lesson/practice attempt writes here, which is what feeds
// Career Readiness on the Dashboard and the trend lines in Performance
// Analytics.
const SkillProgress = sequelize.define(
  'SkillProgress',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    category: {
      type: DataTypes.ENUM('mcq', 'coding', 'ai_tutor', 'aptitude', 'hr', 'company'),
      allowNull: false
    },
    completed: { type: DataTypes.INTEGER, defaultValue: 0 },
    total: { type: DataTypes.INTEGER, defaultValue: 0 },
    correctRate: { type: DataTypes.FLOAT, defaultValue: 0 },
    lastPracticedAt: { type: DataTypes.DATE, allowNull: true }
  },
  {
    tableName: 'skill_progress',
    timestamps: true,
    indexes: [{ unique: true, fields: ['userId', 'category'] }]
  }
);

export default SkillProgress;
