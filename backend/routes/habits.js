import express from 'express';
import {
  getAllHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabit
} from '../controllers/habitController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAllHabits);
router.get('/:id', protect, getHabitById);
router.post('/', protect, createHabit);
router.put('/:id', protect, updateHabit);
router.delete('/:id', protect, deleteHabit);
router.patch('/:id/toggle', protect, toggleHabit);

export default router;
