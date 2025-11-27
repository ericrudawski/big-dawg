import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { StatCard } from '../components/StatCard';
import { HabitCard } from '../components/HabitCard';

interface Habit {
    id: string;
    title: string;
    weeklyTarget: number;
    streak: number;
    category: 'MAIN' | 'MICRO';
    logs: { date: string, value: number }[];
}

export const DashboardPage = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [newHabitTarget, setNewHabitTarget] = useState(3);
    const [newHabitCategory, setNewHabitCategory] = useState<'MAIN' | 'MICRO'>('MAIN');
    const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');

    useEffect(() => {
        const fetchHabitsAndStatus = async () => {
            try {
                const [habitsRes, statusRes] = await Promise.all([
                    api.get('/habits'),
                    api.get(`/habits/status?weekStartDate=${currentWeekStart.toISOString()}`)
                ]);
                setHabits(habitsRes.data);
                setStatus(statusRes.data.status);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchHabitsAndStatus();
    }, []);

    const toggleStatus = async () => {
        const newStatus = status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        try {
            await api.post('/habits/status', {
                weekStartDate: currentWeekStart.toISOString(),
                status: newStatus
            });
            setStatus(newStatus);
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const getWeekStartDate = (date: Date = new Date()) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const currentWeekStart = getWeekStartDate();

    const getWeeklyProgress = (habit: Habit) => {
        const start = currentWeekStart.getTime();
        const end = start + 7 * 24 * 60 * 60 * 1000;

        return habit.logs.filter(l => {
            const logDate = new Date(l.date).getTime();
            return logDate >= start && logDate < end;
        }).length;
    };

    const toggleSlot = async (id: string, action: 'increment' | 'decrement') => {
        try {
            const res = await api.post('/habits/toggle', {
                habitId: id,
                weekStartDate: currentWeekStart.toISOString(),
                action
            });

            if (res.data.message === 'Incremented') {
                setHabits(habits.map(h => {
                    if (h.id === id) {
                        return { ...h, logs: [...h.logs, { date: new Date().toISOString(), value: 1 }] };
                    }
                    return h;
                }));
            } else if (res.data.message === 'Decremented') {
                setHabits(habits.map(h => {
                    if (h.id === id) {
                        // Remove the last log
                        // We need to sort logs to remove the correct one if we want to be precise, 
                        // but for count, just removing one is fine.
                        // However, to keep UI consistent, let's remove the last one added.
                        const newLogs = [...h.logs];
                        newLogs.pop(); // Simple removal for now
                        return { ...h, logs: newLogs };
                    }
                    return h;
                }));
            }

        } catch (error) {
            console.error(error);
        }
    };

    const addHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitTitle.trim()) return;

        try {
            const res = await api.post('/habits', {
                title: newHabitTitle,
                weeklyTarget: newHabitTarget,
                frequency: { type: 'weekly' },
                category: newHabitCategory,
                icon: 'dumbbell'
            });
            setHabits([...habits, { ...res.data, logs: [] }]);
            setNewHabitTitle('');
            setNewHabitTarget(0);
            setNewHabitCategory('MAIN');
        } catch (error) {
            console.error('Failed to create habit', error);
        }
    };

    const deleteHabit = async (id: string) => {
        if (!confirm('DELETE DIRECTIVE?')) return;
        try {
            await api.delete(`/habits/${id}`);
            setHabits(habits.filter(h => h.id !== id));
        } catch (error) {
            console.error('Failed to delete habit', error);
        }
    };

    // Stats
    const mainHabits = habits.filter(h => h.category !== 'MICRO');
    const totalWeeklyTargets = mainHabits.reduce((acc, h) => acc + h.weeklyTarget, 0);
    const totalWeeklyCompleted = mainHabits.reduce((acc, h) => acc + getWeeklyProgress(h), 0);
    const efficiency = status === 'SUSPENDED' ? 'N/A' : (totalWeeklyTargets > 0 ? Math.round((totalWeeklyCompleted / totalWeeklyTargets) * 100) + '%' : '0%');

    return (
        <div className="max-w-2xl mx-auto p-4 pb-32">
            {/* Header */}
            <header className="border-b-4 border-primary pb-4">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                    BLUEPRINT
                </h1>
                <div className="flex justify-between items-end mt-4 font-mono text-sm">
                    <button
                        onClick={toggleStatus}
                        className={`hover:text-primary/70 transition-colors uppercase ${status === 'ACTIVE' ? 'text-[#FF4500]' : ''}`}
                    >
                        STATUS: {status}
                    </button>
                    <span>WEEK OF {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                </div>
            </header>

            {/* Content Wrapper for Suspended State */}
            {/* Added pt-12 to maintain spacing from header, but allow background to stretch up */}
            <div className={`relative transition-all duration-500 pt-12 ${status === 'SUSPENDED' ? 'pointer-events-none select-none' : ''}`}>

                {/* Static Noise Overlay */}
                {status === 'SUSPENDED' && (
                    <div
                        className="absolute inset-0 z-10 bg-background/80"
                        style={{
                            // We use a pseudo-element or just a background image for noise
                            // To make it "loud", we can use a high contrast noise
                        }}
                    >
                        <div
                            className="absolute inset-0 opacity-60 mix-blend-hard-light"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                backgroundSize: '128px 128px'
                            }}
                        />
                        {/* Optional: Scanlines or darkening */}
                        <div className="absolute inset-0 bg-black/20" />
                    </div>
                )}

                {/* Content Container - blurred when suspended */}
                <div className={`transition-all duration-500 ${status === 'SUSPENDED' ? 'blur-sm grayscale contrast-125 opacity-50' : ''}`}>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-12">
                        <StatCard label="WEEKLY REPS" value={`${totalWeeklyCompleted}/${totalWeeklyTargets}`} />
                        <StatCard label="EFFICIENCY" value={`${efficiency}`} />
                    </div>

                    {/* Habits Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b-2 border-primary pb-2">
                            <h2 className="text-xl font-bold">DIRECTIVES</h2>
                            <span className="font-mono text-sm">[{habits.length}]</span>
                        </div>

                        {loading ? (
                            <div className="animate-pulse bg-secondary h-12 w-full"></div>
                        ) : (
                            <div className="space-y-4">
                                {[...habits]
                                    .sort((a, b) => {
                                        if (a.category === 'MICRO' && b.category !== 'MICRO') return -1;
                                        if (a.category !== 'MICRO' && b.category === 'MICRO') return 1;
                                        return 0;
                                    })
                                    .map(habit => (
                                        <HabitCard
                                            key={habit.id}
                                            title={habit.title}
                                            streak={habit.streak}
                                            completedCount={getWeeklyProgress(habit)}
                                            weeklyTarget={habit.weeklyTarget}
                                            category={habit.category}
                                            onToggle={(action) => toggleSlot(habit.id, action)}
                                            onDelete={() => deleteHabit(habit.id)}
                                        />
                                    ))}
                            </div>
                        )}

                        {/* Separator */}
                        <div className="border-t-2 border-dashed border-primary/50 w-full my-2" />

                        {/* Add Habit Form */}
                        <form onSubmit={addHabit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    value={newHabitTitle}
                                    onChange={(e) => setNewHabitTitle(e.target.value)}
                                    placeholder="NEW DIRECTIVE..."
                                    className="w-full bg-transparent border-2 border-primary p-3 font-mono focus:outline-none focus:bg-primary focus:text-background placeholder-muted transition-colors rounded-none"
                                />
                                <div className="flex items-center border-2 border-primary px-3 bg-background w-full rounded-none">
                                    <span className="text-xs font-bold mr-2">TARGET:</span>
                                    <input
                                        type="number"
                                        value={newHabitTarget}
                                        onChange={(e) => setNewHabitTarget(parseInt(e.target.value) || 0)}
                                        className="flex-1 bg-transparent font-mono font-bold focus:outline-none p-3"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setNewHabitCategory('MAIN')}
                                        className={`flex-1 py-3 border-2 border-primary font-bold transition-all ${newHabitCategory === 'MAIN' ? 'bg-primary text-background' : 'bg-transparent text-primary hover:bg-primary/10'}`}
                                    >
                                        MAIN
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewHabitCategory('MICRO')}
                                        className={`flex-1 py-3 border-2 border-primary font-bold transition-all ${newHabitCategory === 'MICRO' ? 'bg-primary text-background' : 'bg-transparent text-primary hover:bg-primary/10'}`}
                                    >
                                        MICRO
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="bg-primary text-background px-8 py-3 font-bold hover:bg-transparent hover:text-primary border-2 border-primary transition-all w-full rounded-none"
                            >
                                ADD DIRECTIVE
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
