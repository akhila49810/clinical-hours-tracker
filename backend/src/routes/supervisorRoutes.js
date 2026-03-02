const express = require('express');
const router = express.Router();
const { getAllLogs, reviewLog, getStudents } = require('../controllers/supervisorController');
const { protect, supervisorOnly } = require('../middleware/authMiddleware');

router.use(protect, supervisorOnly);
router.get('/logs', getAllLogs);
router.put('/logs/:id/review', reviewLog);
router.get('/students', getStudents);

module.exports = router;
