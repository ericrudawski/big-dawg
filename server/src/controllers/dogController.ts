import { Request, Response } from 'express';
import OpenAI from 'openai';
import prisma from '../utils/prisma';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    dangerouslyAllowBrowser: true // Not needed for server but good for safety
});

const isMockMode = !process.env.OPENAI_API_KEY;

export const getDogMotivation = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { habits: { include: { logs: true } } }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        if (isMockMode) {
            return res.json({ message: "Woof! You're doing great! (Mock Mode)" });
        }

        // Calculate simple streak/stats to feed to LLM
        const totalHabits = user.habits.length;
        const completedToday = user.habits.filter((h: any) => {
            const today = new Date().toISOString().split('T')[0];
            return h.logs.some((l: any) => l.date.toISOString().split('T')[0] === today && l.value > 0);
        }).length;

        const prompt = `
      You are a ${user.dogPersonality} dog. 
      User has completed ${completedToday}/${totalHabits} habits today.
      Give a short, 1 - sentence motivational quote or reaction.
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        res.json({ message: completion.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get motivation' });
    }
};

export const chat = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { message } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        // Save user message
        await prisma.chatMessage.create({
            data: { userId, role: 'user', content: message }
        });

        // Get history
        const history = await prisma.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        const systemPrompt = `You are a ${user?.dogPersonality} dog mascot for a habit tracker.Be helpful but stay in character.`;

        if (isMockMode) {
            const response = "Woof woof! I'm a mock dog. Add an API key to hear my real voice!";
            await prisma.chatMessage.create({
                data: { userId, role: 'assistant', content: response }
            });
            return res.json({ message: response });
        }

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...history.reverse().map((h: any) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
                { role: "user", content: message }
            ],
            model: "gpt-3.5-turbo",
        });

        const response = completion.choices[0].message.content || "Woof!";

        // Save assistant message
        await prisma.chatMessage.create({
            data: { userId, role: 'assistant', content: response }
        });

        res.json({ message: response });

    } catch (error) {
        res.status(500).json({ error: 'Chat failed' });
    }
};
