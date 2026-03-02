const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ClinicalLog = sequelize.define('ClinicalLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  supervisorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  hoursLogged: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: false,
    validate: { min: 0.5, max: 24 },
  },
  patientEncounters: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  procedures: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  learningObjectives: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reflections: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'revision_requested'),
    defaultValue: 'pending',
  },
  supervisorFeedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'clinical_logs',
  timestamps: true,
});

module.exports = ClinicalLog;
