const { Op } = require('sequelize');
const { ClinicalLog, User } = require('../models');
const createLog = async (req, res) => {
  try {
    const { date, department, location, hoursLogged, patientEncounters, procedures, learningObjectives, reflections } = req.body;

    const log = await ClinicalLog.create({
      studentId: req.user.id,
      date,
      department,
      location,
      hoursLogged,
      patientEncounters: patientEncounters || 0,
      procedures: procedures || [],
      learningObjectives,
      reflections,
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyLogs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = { studentId: req.user.id };
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { count, rows: logs } = await ClinicalLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'supervisor', attributes: ['id', 'name', 'email'] }],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({ logs, total: count, pages: Math.ceil(count / limit), currentPage: parseInt(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getLogById = async (req, res) => {
  try {
    const log = await ClinicalLog.findByPk(req.params.id, {
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email', 'studentId'] },
        { model: User, as: 'supervisor', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!log) return res.status(404).json({ message: 'Log not found' });

    if (log.studentId !== req.user.id && req.user.role !== 'supervisor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateLog = async (req, res) => {
  try {
    const log = await ClinicalLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    if (log.studentId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (log.status === 'approved') return res.status(400).json({ message: 'Cannot edit an approved log' });

    await log.update(req.body);
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteLog = async (req, res) => {
  try {
    const log = await ClinicalLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    if (log.studentId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (log.status === 'approved') return res.status(400).json({ message: 'Cannot delete an approved log' });

    await log.destroy();
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createLog, getMyLogs, getLogById, updateLog, deleteLog };
