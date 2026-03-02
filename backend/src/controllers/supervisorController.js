const { ClinicalLog, User } = require('../models');


const getAllLogs = async (req, res) => {
  try {
    const { status, studentId, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows: logs } = await ClinicalLog.findAndCountAll({
      where,
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email', 'studentId', 'department'] },
        { model: User, as: 'supervisor', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ logs, total: count, pages: Math.ceil(count / limit), currentPage: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const reviewLog = async (req, res) => {
  try {
    const { status, supervisorFeedback } = req.body;
    const validStatuses = ['approved', 'rejected', 'revision_requested'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const log = await ClinicalLog.findByPk(req.params.id, {
      include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email', 'studentId'] }],
    });
    if (!log) return res.status(404).json({ message: 'Log not found' });

    await log.update({ status, supervisorFeedback, supervisorId: req.user.id, reviewedAt: new Date() });

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']],
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllLogs, reviewLog, getStudents };
