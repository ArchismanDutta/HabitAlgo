import express from 'express';
import {
  getSettings,
  updateSettings,
  updateSyncTime
} from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);
router.patch('/sync', protect, updateSyncTime);

export default router;
