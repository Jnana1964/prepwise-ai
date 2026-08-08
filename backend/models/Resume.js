import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Raw uploaded file + extracted plain text. The scoring/analysis itself
// lives in ResumeAnalysisProfile (one row per resume) - this stays a thin
// record of "what was uploaded / what the text currently is." The
// `rawText` column is also what the direct in-app resume editor
// (resume.controller.js -> updateContent) writes back to.
const Resume = sequelize.define(
  'Resume',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    filename: { type: DataTypes.STRING, allowNull: false },
    storagePath: { type: DataTypes.STRING, allowNull: false },
    rawText: { type: DataTypes.TEXT('long'), allowNull: false },
    jobDescription: { type: DataTypes.TEXT, defaultValue: '' }
  },
  { tableName: 'resumes', timestamps: true }
);

export default Resume;
