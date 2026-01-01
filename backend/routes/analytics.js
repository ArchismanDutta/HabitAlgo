import express from 'express';
import {
  getCurrentSummary,
  getMonthlyData,
  getStreaks,
  getTrends,
  getChartData,
  recalculateSummaries
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', protect, getCurrentSummary);
router.get('/month', protect, getMonthlyData);
router.get('/streaks', protect, getStreaks);
router.get('/trends', protect, getTrends);
router.get('/charts', protect, getChartData);
router.post('/recalculate', protect, recalculateSummaries);

export default router;
