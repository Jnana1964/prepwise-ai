import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Owned exclusively by interview.controller.js. Questions are a genuinely
// relational list (one row each), so unlike ResumeAnalysis this uses a real
// child table (InterviewQuestion) instead of a JSON array - see
// models/InterviewQuestion.js and the association wired in models/index.js.
const InterviewSession = sequelize.define(
  'InterviewSession',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    companyId: { type: DataTypes.INTEGER, allowNull: true },
    companyName: { type: DataTypes.STRING, allowNull: false },
    currentIndex: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.ENUM('active', 'ended'), defaultValue: 'active' },
    overallScore: { type: DataTypes.FLOAT, allowNull: true },
    confidenceScore: { type: DataTypes.INTEGER, allowNull: true },
    communicationScore: { type: DataTypes.INTEGER, allowNull: true },
    technicalScore: { type: DataTypes.INTEGER, allowNull: true },
    behavioralScore: { type: DataTypes.INTEGER, allowNull: true },
    weakTopics: { type: DataTypes.JSON, defaultValue: [] }
  },
  { tableName: 'interview_sessions', timestamps: true }
);

export default InterviewSession;
