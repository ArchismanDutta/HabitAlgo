import express from 'express';
import {
  getSettings,
  updateSettings,
  updateSyncTime
} from '../controllers/settingsController.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', updateSettings);
router.patch('/sync', updateSyncTime);

export default router;
