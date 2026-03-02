const User = require('./User');
const ClinicalLog = require('./ClinicalLog');

User.hasMany(ClinicalLog, { foreignKey: 'studentId', as: 'logs' });
ClinicalLog.belongsTo(User, { foreignKey: 'studentId', as: 'student' });


User.hasMany(ClinicalLog, { foreignKey: 'supervisorId', as: 'reviewedLogs' });
ClinicalLog.belongsTo(User, { foreignKey: 'supervisorId', as: 'supervisor' });

module.exports = { User, ClinicalLog };
