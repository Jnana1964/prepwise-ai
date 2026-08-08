import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// The Resume Analysis Profile - ONE row per resume that every downstream
// module reads from AND writes back to (per the locked write-ownership
// rules below). Scalar scores are real columns; variable-length data
// (skills, sections, suggestions, etc.) are JSON columns - this is the
// "normalized tables + JSON columns where appropriate" shape.
//
// Write ownership (enforced in controllers, not just convention):
//   - resume.controller.js       -> creates the row, and owns atsScore,
//                                    recruiterScore, resumeScore,
//                                    resumeQuality, jdMatch, predictedRole,
//                                    skills, sections, strengths,
//                                    weaknesses, suggestionsByTab, aiReview
//   - jobs.controller.js         -> owns missingSkills only (appends,
//                                    never removes what resume.controller
//                                    wrote)
//   - skills.controller.js       -> never writes to this table at all -
//                                    skill progress lives in its own table
//   - analytics.controller.js    -> never writes, read-only aggregation
//   - analytics dashboard read   -> never writes, read-only + computes
const ResumeAnalysis = sequelize.define(
  'ResumeAnalysis',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    resumeId: { type: DataTypes.INTEGER, allowNull: false, unique: true },

    atsScore: { type: DataTypes.INTEGER, allowNull: false },
    recruiterScore: { type: DataTypes.INTEGER, allowNull: false },
    resumeScore: { type: DataTypes.INTEGER, allowNull: false },
    resumeQuality: { type: DataTypes.INTEGER, allowNull: false },
    jdMatch: { type: DataTypes.INTEGER, allowNull: true },
    predictedRole: { type: DataTypes.STRING, defaultValue: '' },

    skills: { type: DataTypes.JSON, defaultValue: [] },
    missingSkills: { type: DataTypes.JSON, defaultValue: [] },
    missingKeywords: { type: DataTypes.JSON, defaultValue: [] },
    projects: { type: DataTypes.JSON, defaultValue: [] },
    experience: { type: DataTypes.JSON, defaultValue: [] },
    education: { type: DataTypes.JSON, defaultValue: [] },
    certifications: { type: DataTypes.JSON, defaultValue: [] },
    sections: { type: DataTypes.JSON, defaultValue: [] },
    strengths: { type: DataTypes.JSON, defaultValue: [] },
    weaknesses: { type: DataTypes.JSON, defaultValue: [] },
    suggestionsByTab: { type: DataTypes.JSON, defaultValue: {} },

    aiReview: { type: DataTypes.TEXT, defaultValue: '' }
  },
  { tableName: 'resume_analyses', timestamps: true }
);

export default ResumeAnalysis;
