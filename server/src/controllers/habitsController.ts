import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getHabits = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const habits = await prisma.habit.findMany({
            where: { userId },
            include: { logs: true },
        });

        const parsedHabits = habits.map((h: any) => ({
            ...h,
            frequency: JSON.parse(h.frequency)
        }));

        res.json(parsedHabits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
};

export const createHabit = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { title, icon, type, goal, unit, frequency } = req.body;

        const habit = await prisma.habit.create({
            data: {
                userId,
                title,
                icon,
                type,
                goal,
                unit,
                frequency: JSON.stringify(frequency),
            },
        });

        res.status(201).json({ ...habit, frequency: JSON.parse(habit.frequency) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create habit' });
    }
};

export const updateHabit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, icon, type, goal, unit, frequency } = req.body;

        const habit = await prisma.habit.update({
            where: { id },
            data: {
                title,
                icon,
                type,
                goal,
                unit,
                frequency: frequency ? JSON.stringify(frequency) : undefined
            },
        });
        res.json({ ...habit, frequency: JSON.parse(habit.frequency) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update habit' });
    }
};

export const deleteHabit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.habit.delete({ where: { id } });
        res.json({ message: 'Habit deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete habit' });
    }
};

export const logHabit = async (req: Request, res: Response) => {
    try {
        const { habitId, date, value } = req.body;

        const log = await prisma.habitLog.upsert({
            where: {
                habitId_date: {
                    habitId,
                    date: new Date(date),
                },
            },
            update: { value },
            create: {
                habitId,
                date: new Date(date),
                value,
            },
        });
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to log habit' });
    }
};

export const getStats = async (req: Request, res: Response) => {
    // Placeholder for complex stats logic
    res.json({ message: 'Stats endpoint' });
};
