const { Op, fn, col, literal } = require('sequelize');
const { ClinicalLog, User } = require('../models');
const { sequelize } = require('../config/db');


const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    
    const logs = await ClinicalLog.findAll({ where: { studentId } });

    const totalHours = logs.reduce((sum, l) => sum + parseFloat(l.hoursLogged), 0);
    const totalEncounters = logs.reduce((sum, l) => sum + l.patientEncounters, 0);
    const approvedLogs = logs.filter(l => l.status === 'approved');
    const pendingLogs  = logs.filter(l => l.status === 'pending');
    const rejectedLogs = logs.filter(l => l.status === 'rejected');
    const approvedHours = approvedLogs.reduce((sum, l) => sum + parseFloat(l.hoursLogged), 0);

  
    const byDepartment = {};
    logs.forEach(l => {
      byDepartment[l.department] = (byDepartment[l.department] || 0) + parseFloat(l.hoursLogged);
    });

    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyData = {};
    logs
      .filter(l => new Date(l.date) >= sixMonthsAgo)
      .forEach(l => {
        const month = new Date(l.date).toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyData[month] = (monthlyData[month] || 0) + parseFloat(l.hoursLogged);
      });

    
    const procedureCounts = {};
    logs.forEach(l => {
      (l.procedures || []).forEach(p => {
        procedureCounts[p.category] = (procedureCounts[p.category] || 0) + 1;
      });
    });

    
    const recentLogs = await ClinicalLog.findAll({
      where: { studentId },
      include: [{ model: User, as: 'supervisor', attributes: ['name'] }],
      order: [['date', 'DESC']],
      limit: 5,
    });

    res.json({
      stats: {
        totalHours: parseFloat(totalHours.toFixed(1)),
        approvedHours: parseFloat(approvedHours.toFixed(1)),
        totalLogs: logs.length,
        approvedLogs: approvedLogs.length,
        pendingLogs: pendingLogs.length,
        rejectedLogs: rejectedLogs.length,
        totalEncounters,
      },
      byDepartment: Object.entries(byDepartment).map(([name, hours]) => ({ name, hours })),
      monthlyData: Object.entries(monthlyData).map(([month, hours]) => ({ month, hours })),
      procedureCounts: Object.entries(procedureCounts).map(([category, count]) => ({ category, count })),
      recentLogs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getSupervisorDashboard = async (req, res) => {
  try {
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalLogs     = await ClinicalLog.count();
    const pendingReview = await ClinicalLog.count({ where: { status: 'pending' } });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const approvedToday = await ClinicalLog.count({
      where: { status: 'approved', reviewedAt: { [Op.gte]: todayStart } },
    });

  
    const statusRows = await ClinicalLog.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });
    const statusBreakdown = statusRows.map(r => ({ _id: r.status, count: parseInt(r.count) }));

    
    const deptRows = await ClinicalLog.findAll({
      attributes: ['department', [fn('SUM', col('hoursLogged')), 'totalHours'], [fn('COUNT', col('id')), 'count']],
      group: ['department'],
      order: [[literal('totalHours'), 'DESC']],
      limit: 5,
      raw: true,
    });
    const topDepartments = deptRows.map(r => ({
      _id: r.department,
      totalHours: parseFloat(r.totalHours),
      count: parseInt(r.count),
    }));

    
    const recentSubmissions = await ClinicalLog.findAll({
      where: { status: 'pending' },
      include: [{ model: User, as: 'student', attributes: ['id', 'name', 'studentId', 'department'] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.json({ stats: { totalStudents, totalLogs, pendingReview, approvedToday }, statusBreakdown, topDepartments, recentSubmissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudentDashboard, getSupervisorDashboard };
