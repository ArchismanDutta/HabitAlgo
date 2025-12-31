import express from 'express';
import {
  pushChanges,
  pullChanges,
  getSyncStatus
} from '../controllers/syncController.js';

const router = express.Router();

router.post('/push', pushChanges);
router.get('/pull', pullChanges);
router.post('/status', getSyncStatus);

export default router;
