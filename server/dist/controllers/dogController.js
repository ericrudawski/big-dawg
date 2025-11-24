"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = exports.getDogMotivation = void 0;
const openai_1 = __importDefault(require("openai"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const getDogMotivation = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { habits: { include: { logs: true } } }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        // Calculate simple streak/stats to feed to LLM
        const totalHabits = user.habits.length;
        const completedToday = user.habits.filter((h) => {
            const today = new Date().toISOString().split('T')[0];
            return h.logs.some((l) => l.date.toISOString().split('T')[0] === today && l.value > 0);
        }).length;
        const prompt = `
      You are a ${user.dogPersonality} dog. 
      User has completed ${completedToday}/${totalHabits} habits today.
      Give a short, 1-sentence motivational quote or reaction.
    `;
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-3.5-turbo",
        });
        res.json({ message: completion.choices[0].message.content });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get motivation' });
    }
};
exports.getDogMotivation = getDogMotivation;
const chat = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { message } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        // Save user message
        await prisma_1.default.chatMessage.create({
            data: { userId, role: 'user', content: message }
        });
        // Get history
        const history = await prisma_1.default.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        const systemPrompt = `You are a ${user?.dogPersonality} dog mascot for a habit tracker. Be helpful but stay in character.`;
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...history.reverse().map((h) => ({ role: h.role, content: h.content })),
                { role: "user", content: message }
            ],
            model: "gpt-3.5-turbo",
        });
        const response = completion.choices[0].message.content || "Woof!";
        // Save assistant message
        await prisma_1.default.chatMessage.create({
            data: { userId, role: 'assistant', content: response }
        });
        res.json({ message: response });
    }
    catch (error) {
        res.status(500).json({ error: 'Chat failed' });
    }
};
exports.chat = chat;
