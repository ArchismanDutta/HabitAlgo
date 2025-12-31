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

const router = express.Router();

router.get('/', getLogs);
router.get('/day/:date', getLogsByDate);
router.post('/', createOrUpdateLog);
router.post('/bulk', bulkCreateOrUpdateLogs);
router.put('/:id', updateLog);
router.delete('/:id', deleteLog);

// Reflection routes
router.post('/reflection', saveReflection);
router.get('/reflection/:date', getReflection);

// Screen time routes
router.post('/screentime', saveScreenTime);
router.get('/screentime/month', getScreenTimeByMonth);

export default router;
