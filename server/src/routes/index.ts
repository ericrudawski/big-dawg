import { Router } from 'express';
import multer from 'multer';
import { register, login, me, updateUser } from '../controllers/authController';
import { getHabits, createHabit, updateHabit, deleteHabit, logHabit, toggleSlot, getWeekStatus, toggleWeekStatus, getStats } from '../controllers/habitsController';
import { getDogMotivation } from '../controllers/dogController';
import { authenticateToken } from '../middleware/auth';
import { analyzeImage } from '../controllers/uploadController';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, me);
router.put('/auth/me', authenticateToken, updateUser);

// Habits
router.get('/habits', authenticateToken, getHabits);
router.post('/habits', authenticateToken, createHabit);
router.put('/habits/:id', authenticateToken, updateHabit);
router.delete('/habits/:id', authenticateToken, deleteHabit);

// Status
router.get('/habits/status', authenticateToken, getWeekStatus);
router.post('/habits/status', authenticateToken, toggleWeekStatus);
router.get('/stats', authenticateToken, getStats);

// Logs
router.post('/habit-logs', authenticateToken, logHabit);
router.post('/habits/toggle', authenticateToken, toggleSlot);

// Dog
router.get('/dog/motivation', authenticateToken, getDogMotivation);

// Uploads
router.post('/uploads/image-analyze', authenticateToken, upload.single('image'), analyzeImage);

export default router;
