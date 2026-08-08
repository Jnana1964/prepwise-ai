import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const InterviewQuestion = sequelize.define(
  'InterviewQuestion',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.INTEGER, allowNull: false },
    position: { type: DataTypes.INTEGER, allowNull: false },
    prompt: { type: DataTypes.TEXT, allowNull: false },
    type: {
      type: DataTypes.ENUM('hr', 'technical', 'coding', 'resume', 'project', 'behavioral'),
      allowNull: false
    },
    answer: { type: DataTypes.TEXT, defaultValue: '' },
    communication: { type: DataTypes.INTEGER, allowNull: true },
    technical: { type: DataTypes.INTEGER, allowNull: true },
    confidence: { type: DataTypes.INTEGER, allowNull: true }
  },
  { tableName: 'interview_questions', timestamps: true }
);

export default InterviewQuestion;
