import express from 'express';
import {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise
} from '../controllers/exerciseController.js';
import {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  getTodayProgram
} from '../controllers/gymProgramController.js';
import {
  startSession,
  updateSession,
  completeSession,
  getSessions,
  getSession,
  deleteSession
} from '../controllers/workoutSessionController.js';
import {
  upsertMetrics,
  getMetrics,
  getLatestMetrics,
  deleteMetrics,
  createGoal,
  getGoals,
  getActiveGoal,
  updateGoal,
  deleteGoal
} from '../controllers/metricsController.js';
import {
  getSupplements,
  getSupplement,
  createSupplement,
  updateSupplement,
  deleteSupplement,
  logSupplement,
  getSupplementLogs,
  updateSupplementLog,
  deleteSupplementLog,
  getAdherenceStats
} from '../controllers/supplementController.js';
import {
  getVolumeAnalytics,
  getPersonalRecords,
  getExerciseProgress,
  getProgressSummary,
  getStrengthComparison
} from '../controllers/analyticsGymController.js';

const router = express.Router();

// ===== EXERCISES =====
router.get('/exercises', getExercises);
router.get('/exercises/:id', getExercise);
router.post('/exercises', createExercise);
router.put('/exercises/:id', updateExercise);
router.delete('/exercises/:id', deleteExercise);

// ===== WORKOUT PROGRAMS =====
router.get('/programs', getPrograms);
router.get('/programs/today', getTodayProgram);
router.get('/programs/:id', getProgram);
router.post('/programs', createProgram);
router.put('/programs/:id', updateProgram);
router.delete('/programs/:id', deleteProgram);

// ===== WORKOUT SESSIONS =====
router.post('/sessions', startSession);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSession);
router.put('/sessions/:id', updateSession);
router.post('/sessions/:id/complete', completeSession);
router.delete('/sessions/:id', deleteSession);

// ===== BODY METRICS =====
router.post('/metrics', upsertMetrics);
router.get('/metrics', getMetrics);
router.get('/metrics/latest', getLatestMetrics);
router.delete('/metrics/:id', deleteMetrics);

// ===== BODY GOALS =====
router.post('/goals', createGoal);
router.get('/goals', getGoals);
router.get('/goals/active', getActiveGoal);
router.put('/goals/:id', updateGoal);
router.delete('/goals/:id', deleteGoal);

// ===== SUPPLEMENT LOGS ===== (Must be before :id routes)
router.post('/supplements/logs', logSupplement);
router.get('/supplements/logs', getSupplementLogs);
router.put('/supplements/logs/:id', updateSupplementLog);
router.delete('/supplements/logs/:id', deleteSupplementLog);
router.get('/supplements/adherence', getAdherenceStats);

// ===== SUPPLEMENTS =====
router.get('/supplements', getSupplements);
router.get('/supplements/:id', getSupplement);
router.post('/supplements', createSupplement);
router.put('/supplements/:id', updateSupplement);
router.delete('/supplements/:id', deleteSupplement);

// ===== ANALYTICS =====
router.get('/analytics/volume', getVolumeAnalytics);
router.get('/analytics/prs', getPersonalRecords);
router.get('/analytics/exercise/:exerciseId', getExerciseProgress);
router.get('/analytics/progress', getProgressSummary);
router.get('/analytics/comparison', getStrengthComparison);

export default router;
