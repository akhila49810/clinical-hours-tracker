const express = require('express');
const router = express.Router();
const { createLog, getMyLogs, getLogById, updateLog, deleteLog } = require('../controllers/logController');
const { protect, studentOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getMyLogs).post(studentOnly, createLog);
router.route('/:id').get(getLogById).put(studentOnly, updateLog).delete(studentOnly, deleteLog);

module.exports = router;
