const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WorkerProfile = sequelize.define('WorkerProfile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: false
  },
  skills: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      return JSON.parse(this.getDataValue('skills') || '[]');
    },
    set(val) {
      this.setDataValue('skills', JSON.stringify(val));
    }
  },
  hourlyRate: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0.01,
      isDecimal: true
    }
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  numReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  availability: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      return JSON.parse(this.getDataValue('availability') || '[]');
    },
    set(val) {
      this.setDataValue('availability', JSON.stringify(val));
    }
  }
}, {
  timestamps: true,
});

module.exports = WorkerProfile;
