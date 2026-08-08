import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    unreadNotifications: { type: DataTypes.INTEGER, defaultValue: 0 },
    plan: { type: DataTypes.ENUM('free', 'pro'), defaultValue: 'free' }
  },
  { tableName: 'users', timestamps: true }
);

export default User;
