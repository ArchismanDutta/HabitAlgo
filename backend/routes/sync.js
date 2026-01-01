import express from 'express';
import {
  pushChanges,
  pullChanges,
  getSyncStatus
} from '../controllers/syncController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/push', protect, pushChanges);
router.get('/pull', protect, pullChanges);
router.post('/status', protect, getSyncStatus);

export default router;
