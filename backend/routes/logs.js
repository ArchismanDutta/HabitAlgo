import express from 'express';
import {
  getLogs,
  getLogsByDate,
  createOrUpdateLog,
  bulkCreateOrUpdateLogs,
  updateLog,
  deleteLog,
  saveReflection,
  getReflection,
  saveScreenTime,
  getScreenTimeByMonth
} from '../controllers/logController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getLogs);
router.get('/day/:date', protect, getLogsByDate);
router.post('/', protect, createOrUpdateLog);
router.post('/bulk', protect, bulkCreateOrUpdateLogs);
router.put('/:id', protect, updateLog);
router.delete('/:id', protect, deleteLog);

// Reflection routes
router.post('/reflection', protect, saveReflection);
router.get('/reflection/:date', protect, getReflection);

// Screen time routes
router.post('/screentime', protect, saveScreenTime);
router.get('/screentime/month', protect, getScreenTimeByMonth);

export default router;
