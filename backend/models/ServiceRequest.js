const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ServiceRequest = sequelize.define('ServiceRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  budget: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'assigned', 'completed', 'cancelled'),
    defaultValue: 'open'
  },
  workerId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true,
});

module.exports = ServiceRequest;
