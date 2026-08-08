import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Job = sequelize.define(
  'Job',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    company: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, defaultValue: 'Remote' },
    salary: { type: DataTypes.STRING, defaultValue: '' },
    jobType: { type: DataTypes.STRING, defaultValue: 'Internship' },
    requiredSkills: { type: DataTypes.JSON, defaultValue: [] },
    tags: { type: DataTypes.JSON, defaultValue: [] },
    applyUrl: { type: DataTypes.STRING, allowNull: false },
    source: { type: DataTypes.STRING, defaultValue: 'manual' }
  },
  { tableName: 'jobs', timestamps: true }
);

export default Job;
