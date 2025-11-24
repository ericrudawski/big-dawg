"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const authController_1 = require("../controllers/authController");
const habitsController_1 = require("../controllers/habitsController");
const dogController_1 = require("../controllers/dogController");
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
// Auth
router.post('/auth/register', authController_1.register);
router.post('/auth/login', authController_1.login);
router.get('/auth/me', auth_1.authenticateToken, authController_1.me);
// Habits
router.get('/habits', auth_1.authenticateToken, habitsController_1.getHabits);
router.post('/habits', auth_1.authenticateToken, habitsController_1.createHabit);
router.put('/habits/:id', auth_1.authenticateToken, habitsController_1.updateHabit);
router.delete('/habits/:id', auth_1.authenticateToken, habitsController_1.deleteHabit);
// Logs
router.post('/habit-logs', auth_1.authenticateToken, habitsController_1.logHabit);
// Dog & Chat
router.get('/dog/motivation', auth_1.authenticateToken, dogController_1.getDogMotivation);
router.post('/chat', auth_1.authenticateToken, dogController_1.chat);
// Uploads
router.post('/uploads/image-analyze', auth_1.authenticateToken, upload.single('image'), uploadController_1.analyzeImage);
exports.default = router;
