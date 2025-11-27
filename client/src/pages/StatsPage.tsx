import React, { useEffect, useState } from 'react';
import api from '../utils/api';

interface Habit {
    id: string;
    title: string;
    weeklyTarget: number;
    logs: { date: string, value: number }[];
}

interface Stats {
    efficiency: number;
    perfectWeeks: number;
    perfectWeekStreak: number;
    lowestEfficiencyHabitId: string | null;
    totalSuspendedWeeks: number;
}

export const StatsPage = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [weeklyStatuses, setWeeklyStatuses] = useState<{ weekStart: string, status: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const habitsRes = await api.get('/habits');
                setHabits(habitsRes.data);

                // Fetch statuses for past weeks
                const weeks = getPastWeeks();
                const statusPromises = weeks.map(w =>
                    api.get(`/habits/status?weekStartDate=${w.start.toISOString()}`)
                );

                const statusesRes = await Promise.all(statusPromises);
                const statuses = statusesRes.map((res, idx) => ({
                    weekStart: weeks[idx].start.toISOString(),
                    status: res.data.status
                }));
                setWeeklyStatuses(statuses);

                const statsRes = await api.get('/stats');
                setStats(statsRes.data);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper to get past 4 weeks
    const getPastWeeks = () => {
        const weeks = [];
        const today = new Date();
        // Adjust to Monday
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const currentWeekStart = new Date(today.setDate(diff));
        currentWeekStart.setHours(0, 0, 0, 0);

        for (let i = 0; i < 4; i++) {
            const start = new Date(currentWeekStart);
            start.setDate(start.getDate() - (i * 7));
            const end = new Date(start);
            end.setDate(end.getDate() + 7);
            weeks.push({ start, end, label: `WEEK ${4 - i}` }); // Simplified label
        }
        return weeks;
    };

    const weeks = getPastWeeks();

    const getWeeklyCompletion = (habit: Habit, start: Date, end: Date) => {
        const startTime = start.getTime();
        const endTime = end.getTime();
        return habit.logs.filter(l => {
            const logDate = new Date(l.date).getTime();
            return logDate >= startTime && logDate < endTime;
        }).length;
    };

    const getStatusForWeek = (start: Date) => {
        const s = weeklyStatuses.find(ws => ws.weekStart === start.toISOString());
        return s?.status || 'ACTIVE';
    };

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-12 pb-32">
            <header className="border-b-4 border-primary pb-4">
                <h1 className="text-4xl font-black uppercase tracking-tighter">
                    PERFORMANCE<br />ANALYTICS
                </h1>
            </header>

            {/* Stats Summary */}
            {stats && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-primary p-4 flex flex-col items-start justify-center bg-secondary/10">
                        <span className="text-xs font-mono text-muted uppercase mb-1">YTD Efficiency</span>
                        <span className="text-3xl font-black">{stats.efficiency}%</span>
                    </div>
                    <div className="border-2 border-primary p-4 flex flex-col items-start justify-center bg-secondary/10">
                        <span className="text-xs font-mono text-muted uppercase mb-1">Perfect Weeks</span>
                        <span className="text-3xl font-black">{stats.perfectWeeks}</span>
                    </div>
                    <div className="border-2 border-primary p-4 flex flex-col items-start justify-center bg-secondary/10">
                        <span className="text-xs font-mono text-muted uppercase mb-1">Perfect Week Streak</span>
                        <span className="text-3xl font-black">{stats.perfectWeekStreak}</span>
                    </div>
                    <div className="border-2 border-primary p-4 flex flex-col items-start justify-center bg-secondary/10">
                        <span className="text-xs font-mono text-muted uppercase mb-1">Suspended Weeks</span>
                        <span className="text-3xl font-black">{stats.totalSuspendedWeeks}</span>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="animate-pulse bg-secondary h-64 w-full"></div>
            ) : (
                <div className="space-y-8">
                    {habits.map(habit => {
                        const isLowestEfficiency = stats?.lowestEfficiencyHabitId === habit.id;
                        return (
                            <div
                                key={habit.id}
                                className={`border-2 p-6 transition-all ${isLowestEfficiency ? 'border-[#FF4500]' : 'border-primary'}`}
                            >
                                <div className="flex justify-between items-end mb-4">
                                    <h2 className="text-xl font-bold uppercase">{habit.title}</h2>
                                    <span className="font-mono text-sm text-muted">TARGET: {habit.weeklyTarget}/WK</span>
                                </div>

                                {/* Weekly History Grid */}
                                <div className="grid grid-cols-4 gap-2">
                                    {weeks.slice().reverse().map((week, idx) => {
                                        const count = getWeeklyCompletion(habit, week.start, week.end);
                                        const percentage = Math.min(100, Math.round((count / habit.weeklyTarget) * 100));
                                        const isMet = count >= habit.weeklyTarget;
                                        const status = getStatusForWeek(week.start);
                                        const isSuspended = status === 'SUSPENDED';

                                        return (
                                            <div key={idx} className="flex flex-col items-center gap-2">
                                                <div className="h-24 w-full bg-secondary relative flex items-end border-2 border-muted/20 overflow-hidden">
                                                    {isSuspended ? (
                                                        <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                                                            <span className="text-xs font-mono -rotate-90 text-muted">SUSPENDED</span>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            style={{ height: `${percentage}%` }}
                                                            className={`w-full transition-all ${isMet ? 'bg-primary' : 'bg-muted'}`}
                                                        />
                                                    )}
                                                </div>
                                                <div className="text-xs font-mono text-center">
                                                    {week.start.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                                                </div>
                                                <div className="font-bold text-sm">
                                                    {isSuspended ? '-' : `${count}/${habit.weeklyTarget}`}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
