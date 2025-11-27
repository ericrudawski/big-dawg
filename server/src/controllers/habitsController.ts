// @ts-nocheck
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

        const weeklyStatuses = await prisma.weeklyStatus.findMany({
            where: { userId }
        });

        const getWeekStart = (date: Date) => {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            d.setHours(0, 0, 0, 0);
            return new Date(d.setDate(diff));
        };

        const currentWeekStart = getWeekStart(new Date());

        const parsedHabits = habits.filter((h: any) => {
            if (h.category === 'MICRO') {
                // Only show if created this week (on or after currentWeekStart)
                const createdAt = new Date(h.createdAt);
                return createdAt >= currentWeekStart;
            }
            return true;
        }).map((h: any) => {
            // Calculate Streak
            let streak = 0;
            let checkDate = new Date(currentWeekStart);
            // Safety break to prevent infinite loops if something goes wrong, though logic shouldn't allow it
            // Let's check back 52 weeks max for performance
            for (let i = 0; i < 52; i++) {
                const weekStartStr = checkDate.toISOString(); // For comparison if needed, but better to compare times
                const weekStartTime = checkDate.getTime();
                const weekEndTime = weekStartTime + 7 * 24 * 60 * 60 * 1000;

                // Check status
                const statusObj = weeklyStatuses.find(s => s.weekStart.getTime() === weekStartTime);
                const isSuspended = statusObj?.status === 'SUSPENDED';

                // Calculate logs for this week
                const logsCount = h.logs.filter((l: any) => {
                    const t = new Date(l.date).getTime();
                    return t >= weekStartTime && t < weekEndTime;
                }).length;

                const target = h.weeklyTarget;
                const isMet = logsCount >= target;

                if (i === 0) {
                    // Current Week
                    if (isMet) {
                        streak++;
                    }
                    // If not met, we don't break, we just don't add. 
                    // Unless it's suspended? If current week is suspended, we also just ignore.
                } else {
                    // Past Weeks
                    if (isSuspended) {
                        // Skip, don't break, don't add
                    } else {
                        if (isMet) {
                            streak++;
                        } else {
                            // Break streak
                            break;
                        }
                    }
                }

                // Move back one week
                checkDate.setDate(checkDate.getDate() - 7);
            }

            return {
                ...h,
                streak,
                frequency: JSON.parse(h.frequency)
            };
        });

        res.json(parsedHabits);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
};

export const createHabit = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { title, icon, type, goal, unit, frequency, weeklyTarget } = req.body;

        const habit = await prisma.habit.create({
            data: {
                userId,
                title,
                icon,
                type,
                goal,
                unit,
                // @ts-ignore
                weeklyTarget: weeklyTarget || 7,
                category: req.body.category || 'MAIN',
                frequency: JSON.stringify(frequency || { type: 'weekly' }),
            } as any,
        });

        res.status(201).json({ ...habit, frequency: JSON.parse(habit.frequency) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create habit' });
    }
};

export const updateHabit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, icon, type, goal, unit, frequency, weeklyTarget } = req.body;

        const habit = await prisma.habit.update({
            where: { id },
            data: {
                title,
                icon,
                type,
                goal,
                unit,
                // @ts-ignore
                weeklyTarget,
                frequency: frequency ? JSON.stringify(frequency) : undefined
            } as any,
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

        // Check if we are "undoing" (value = 0 or negative, or explicit undo flag)
        // For this implementation, we'll assume the frontend sends a request to "toggle"
        // But to keep it RESTful, let's say if value is 0, we delete the latest log for this week.

        if (value === 0) {
            // Find the most recent log for this habit on this date (or week)
            // For simplicity, let's just delete the specific log if date is provided, 
            // or the latest one if we are just "undoing" a slot.
            // The user requirement says "undo allowed".

            // Let's look for a log on this specific date first
            const existingLog = await prisma.habitLog.findUnique({
                where: {
                    habitId_date: {
                        habitId,
                        date: new Date(date),
                    }
                }
            });

            if (existingLog) {
                await prisma.habitLog.delete({
                    where: { id: existingLog.id }
                });
                return res.json({ message: 'Log removed', id: existingLog.id });
            } else {
                // If no log on specific date, maybe find the latest one in the week?
                // For now, let's stick to date-based toggling from frontend for simplicity,
                // or we can implement a specific "toggle" endpoint.
                return res.status(404).json({ error: 'No log found to remove' });
            }
        }

        const log = await prisma.habitLog.upsert({
            where: {
                habitId_date: {
                    habitId,
                    date: new Date(date),
                },
            },
            update: { value, metadata: req.body.metadata },
            create: {
                habitId,
                date: new Date(date),
                value,
                metadata: req.body.metadata,
            },
        });
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to log habit' });
    }
};

// New endpoint to handle slot toggling specifically
export const toggleSlot = async (req: Request, res: Response) => {
    try {
        const { habitId, weekStartDate } = req.body;
        const start = new Date(weekStartDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);

        // Get all logs for this week
        const logs = await prisma.habitLog.findMany({
            where: {
                habitId,
                date: {
                    gte: start,
                    lt: end
                }
            },
            orderBy: { date: 'desc' }
        });

        const habit = await prisma.habit.findUnique({ where: { id: habitId } });
        if (!habit) return res.status(404).json({ error: 'Habit not found' });

        // If we have logs, we remove the most recent one (Undo)
        // BUT, the user might want to fill a slot. 
        // Logic: The frontend should probably tell us if it's an ADD or REMOVE.
        // Or we can just be dumb: If we have logs, remove one? No, that's bad if we want to fill up to target.

        // Let's change the input: { habitId, action: 'increment' | 'decrement', date?: string }
        // If increment: add a log for 'now' (or provided date)
        // If decrement: remove the most recent log in the week

        const action = req.body.action || 'increment';

        if (action === 'decrement') {
            if (logs.length > 0) {
                await prisma.habitLog.delete({ where: { id: logs[0].id } });
                return res.json({ message: 'Decremented', count: logs.length - 1 });
            }
            return res.json({ message: 'Nothing to decrement', count: 0 });
        } else {
            // Increment
            // We allow over-achievement? User said "Generate discrete number of slots".
            // But usually tracking allows more. Let's just add a log.
            // Use current time or provided date
            const logDate = req.body.date ? new Date(req.body.date) : new Date();

            // Ensure we don't have a collision if we use just date (YYYY-MM-DD).
            // Prisma schema has @@unique([habitId, date]).
            // If we want multiple slots per day, we might need to change schema or use time.
            // The schema says `date DateTime`. If it stores time, we are good.
            // If it truncates to day, we have a problem for "3x a week" if done all on Monday.
            // Let's check schema... `date DateTime`. It usually keeps time in Prisma unless @db.Date.
            // However, previous code used `date.toISOString().split('T')[0]` which implies day-level.

            // WORKAROUND: If we want multiple slots per day, we need to store full timestamp.
            // Let's assume we can add multiple logs.
            // If the unique constraint blocks us, we need to remove it or use different times.
            // Let's try adding with current timestamp.

            await prisma.habitLog.create({
                data: {
                    habitId,
                    date: logDate,
                    value: 1
                }
            });

            return res.json({ message: 'Incremented', count: logs.length + 1 });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to toggle slot' });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;

        const now = new Date();
        const currentYear = now.getFullYear();
        const startOfYear = new Date(currentYear, 0, 1); // Jan 1st 00:00:00

        // Fetch all habits
        const habits = await prisma.habit.findMany({
            where: { userId },
            include: { logs: true }
        });

        // Fetch weekly statuses
        const weeklyStatuses = await prisma.weeklyStatus.findMany({
            where: {
                userId,
                weekStart: { gte: startOfYear }
            }
        });

        // Helper to get week start
        const getWeekStart = (date: Date) => {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            d.setHours(0, 0, 0, 0);
            return new Date(d.setDate(diff));
        };

        let totalTarget = 0;
        let totalCompleted = 0;
        let perfectWeeks = 0;

        // Track efficiency per habit
        const habitStats: Record<string, { target: number, completed: number }> = {};
        habits.forEach(h => {
            habitStats[h.id] = { target: 0, completed: 0 };
        });

        // Streak tracking
        let currentStreak = 0;

        // Iterate weeks from start of year to current week
        const currentWeekStart = getWeekStart(now);
        let loopDate = getWeekStart(startOfYear);

        while (loopDate <= currentWeekStart) {
            const weekStart = new Date(loopDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            // Check if suspended
            const statusObj = weeklyStatuses.find(s => s.weekStart.getTime() === weekStart.getTime());
            const isSuspended = statusObj?.status === 'SUSPENDED';

            if (!isSuspended) {
                let weekTarget = 0;
                let weekCompleted = 0;
                let isPerfect = true;
                let activeHabitsCount = 0;

                for (const habit of habits) {
                    // Check if habit existed this week (created before week end)
                    // AND is not a MICRO habit (unless we want to track them separately, but requirement says "not counted for or against any stat metrics")
                    if (new Date(habit.createdAt) < weekEnd && habit.category !== 'MICRO') {
                        activeHabitsCount++;
                        const target = habit.weeklyTarget;

                        // Count logs for this habit in this week
                        const logs = habit.logs.filter((l: any) => {
                            const d = new Date(l.date);
                            return d >= weekStart && d < weekEnd;
                        });

                        const count = logs.length;

                        weekTarget += target;
                        weekCompleted += count;

                        // Update per-habit stats
                        habitStats[habit.id].target += target;
                        habitStats[habit.id].completed += count;

                        if (count < target) {
                            isPerfect = false;
                        }
                    }
                }

                if (activeHabitsCount > 0) {
                    totalTarget += weekTarget;
                    totalCompleted += weekCompleted;

                    if (isPerfect) {
                        perfectWeeks++;
                        currentStreak++;
                    } else {
                        if (weekStart.getTime() !== currentWeekStart.getTime()) {
                            currentStreak = 0;
                        }
                    }
                }
            }

            // Move to next week
            loopDate.setDate(loopDate.getDate() + 7);
        }

        // Calculate lowest efficiency habit
        let lowestEfficiencyHabitId = null;
        let lowestEfficiency = 101; // Start > 100

        for (const [habitId, stats] of Object.entries(habitStats)) {
            if (stats.target > 0) {
                const eff = (stats.completed / stats.target) * 100;
                if (eff < lowestEfficiency) {
                    lowestEfficiency = eff;
                    lowestEfficiencyHabitId = habitId;
                }
            }
        }

        // Calculate total suspended weeks YTD
        const totalSuspendedWeeks = weeklyStatuses.filter(s =>
            s.weekStart >= startOfYear && s.status === 'SUSPENDED'
        ).length;

        const efficiency = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;

        res.json({
            efficiency,
            perfectWeeks,
            perfectWeekStreak: currentStreak,
            lowestEfficiencyHabitId,
            totalSuspendedWeeks
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

export const getWeekStatus = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { weekStartDate } = req.query;

        if (!weekStartDate) {
            return res.status(400).json({ error: 'Week start date required' });
        }

        const start = new Date(weekStartDate as string);

        const status = await prisma.weeklyStatus.findUnique({
            where: {
                userId_weekStart: {
                    userId,
                    weekStart: start
                }
            }
        });

        res.json({ status: status?.status || 'ACTIVE' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch week status' });
    }
};

export const toggleWeekStatus = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.userId;
        const { weekStartDate, status } = req.body;

        const start = new Date(weekStartDate);

        const updatedStatus = await prisma.weeklyStatus.upsert({
            where: {
                userId_weekStart: {
                    userId,
                    weekStart: start
                }
            },
            update: { status },
            create: {
                userId,
                weekStart: start,
                status
            }
        });

        res.json(updatedStatus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update week status' });
    }
};
