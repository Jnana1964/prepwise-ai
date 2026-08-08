import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Written by services/metrics.js only, called from whichever controller
// just changed a score. Performance Analytics (analytics.controller.js)
// reads a time series from this table instead of caching a single "latest"
// number - that's what lets it show real deltas ("72 -> 84") instead of a
// static value. Analytics itself never writes here.
const MetricSnapshot = sequelize.define(
  'MetricSnapshot',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    metric: {
      type: DataTypes.ENUM('ats_score', 'resume_score', 'interview_score', 'coding_score', 'aptitude_score', 'applications_count'),
      allowNull: false
    },
    value: { type: DataTypes.FLOAT, allowNull: false },
    recordedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  { tableName: 'metric_snapshots', timestamps: true }
);

export default MetricSnapshot;
