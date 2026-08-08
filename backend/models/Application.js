import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Application = sequelize.define(
  'Application',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    jobId: { type: DataTypes.INTEGER, allowNull: true },
    company: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    matchPercent: { type: DataTypes.INTEGER, allowNull: true },
    status: {
      type: DataTypes.ENUM('saved', 'applied', 'online_assessment', 'interview', 'hr', 'offered', 'rejected'),
      defaultValue: 'saved'
    },
    appliedOn: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    notes: { type: DataTypes.TEXT, defaultValue: '' }
  },
  { tableName: 'applications', timestamps: true }
);

export default Application;
