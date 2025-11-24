import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { DogMascot } from '../components/DogMascot';
import { Check, Plus } from 'lucide-react';

interface Habit {
    id: string;
    title: string;
    logs: { date: string, value: number }[];
}

export const DashboardPage = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const res = await api.get('/habits');
                setHabits(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchHabits();
    }, []);

    const toggleHabit = async (id: string) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            await api.post('/habit-logs', {
                habitId: id,
                date: today,
                value: 1 // Toggle logic would be more complex in real app
            });
            // Optimistic update
            setHabits(habits.map(h => {
                if (h.id === id) {
                    return { ...h, logs: [...h.logs, { date: today, value: 1 }] };
                }
                return h;
            }));
        } catch (error) {
            console.error(error);
        }
    };

    const isCompletedToday = (habit: Habit) => {
        const today = new Date().toISOString().split('T')[0];
        return habit.logs.some(l => l.date.split('T')[0] === today && l.value > 0);
    };

    return (
        <div className="space-y-8">
            <DogMascot />

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <h2 className="text-2xl font-serif text-text">Today's Tasks</h2>
                    <span className="text-sm text-muted">{new Date().toLocaleDateString()}</span>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : habits.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-muted/20 rounded-xl">
                        <p className="text-muted mb-4">No habits yet.</p>
                        <button className="text-primary font-medium hover:underline">Create your first habit</button>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {habits.map(habit => {
                            const completed = isCompletedToday(habit);
                            return (
                                <button
                                    key={habit.id}
                                    onClick={() => toggleHabit(habit.id)}
                                    className={`flex items - center justify - between p - 4 rounded - xl border transition - all duration - 300 ${completed
                                            ? 'bg-primary/10 border-primary/20'
                                            : 'bg-surface border-muted/10 hover:border-primary/30'
                                        } `}
                                >
                                    <span className={`font - medium ${completed ? 'text-primary line-through' : 'text-text'} `}>
                                        {habit.title}
                                    </span>
                                    <div className={`w - 6 h - 6 rounded - full flex items - center justify - center border ${completed ? 'bg-primary border-primary text-white' : 'border-muted/30'
                                        } `}>
                                        {completed && <Check size={14} strokeWidth={3} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
