import { Router } from 'express';
import multer from 'multer';
import { register, login, me } from '../controllers/authController';
import { getHabits, createHabit, updateHabit, deleteHabit, logHabit } from '../controllers/habitsController';
import { getDogMotivation, chat } from '../controllers/dogController';
import { analyzeImage } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, me);

// Habits
router.get('/habits', authenticateToken, getHabits);
router.post('/habits', authenticateToken, createHabit);
router.put('/habits/:id', authenticateToken, updateHabit);
router.delete('/habits/:id', authenticateToken, deleteHabit);

// Logs
router.post('/habit-logs', authenticateToken, logHabit);

// Dog & Chat
router.get('/dog/motivation', authenticateToken, getDogMotivation);
router.post('/chat', authenticateToken, chat);

// Uploads
router.post('/uploads/image-analyze', authenticateToken, upload.single('image'), analyzeImage);

export default router;
