import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

// Searchable company list for Mock Assessment / AI Mock Interview -
// replaces the old hardcoded 5-company dropdown. Seed data in
// data/companiesSeed.js / scripts/seedCompanies.js; extend the table with
// more rows any time, no code change needed for new companies to show up
// in search.
const Company = sequelize.define(
  'Company',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    industry: { type: DataTypes.STRING, defaultValue: '' },
    logoInitial: { type: DataTypes.STRING(2), defaultValue: '' },
    assessmentPattern: {
      type: DataTypes.ENUM('aptitude_heavy', 'coding_heavy', 'balanced', 'behavioral_heavy'),
      defaultValue: 'balanced'
    }
  },
  { tableName: 'companies', timestamps: true }
);

export default Company;
