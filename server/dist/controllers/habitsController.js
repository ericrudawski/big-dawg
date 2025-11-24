"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.logHabit = exports.deleteHabit = exports.updateHabit = exports.createHabit = exports.getHabits = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getHabits = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const habits = await prisma_1.default.habit.findMany({
            where: { userId },
            include: { logs: true },
        });
        res.json(habits);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
};
exports.getHabits = getHabits;
const createHabit = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { title, icon, type, goal, unit, frequency } = req.body;
        const habit = await prisma_1.default.habit.create({
            data: {
                userId,
                title,
                icon,
                type,
                goal,
                unit,
                frequency,
            },
        });
        res.status(201).json(habit);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create habit' });
    }
};
exports.createHabit = createHabit;
const updateHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, icon, type, goal, unit, frequency } = req.body;
        const habit = await prisma_1.default.habit.update({
            where: { id },
            data: { title, icon, type, goal, unit, frequency },
        });
        res.json(habit);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update habit' });
    }
};
exports.updateHabit = updateHabit;
const deleteHabit = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.habit.delete({ where: { id } });
        res.json({ message: 'Habit deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete habit' });
    }
};
exports.deleteHabit = deleteHabit;
const logHabit = async (req, res) => {
    try {
        const { habitId, date, value } = req.body;
        const log = await prisma_1.default.habitLog.upsert({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to log habit' });
    }
};
exports.logHabit = logHabit;
const getStats = async (req, res) => {
    // Placeholder for complex stats logic
    res.json({ message: 'Stats endpoint' });
};
exports.getStats = getStats;
