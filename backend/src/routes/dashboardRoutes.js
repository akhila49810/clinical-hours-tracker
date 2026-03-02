const express = require('express');
const router = express.Router();
const { getStudentDashboard, getSupervisorDashboard } = require('../controllers/dashboardController');
const { protect, studentOnly, supervisorOnly } = require('../middleware/authMiddleware');

router.get('/student', protect, studentOnly, getStudentDashboard);
router.get('/supervisor', protect, supervisorOnly, getSupervisorDashboard);

module.exports = router;
