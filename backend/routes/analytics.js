import express from 'express';
import {
  getCurrentSummary,
  getMonthlyData,
  getStreaks,
  getTrends,
  getChartData,
  recalculateSummaries
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/summary', getCurrentSummary);
router.get('/month', getMonthlyData);
router.get('/streaks', getStreaks);
router.get('/trends', getTrends);
router.get('/charts', getChartData);
router.post('/recalculate', recalculateSummaries);

export default router;
