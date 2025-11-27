import React from 'react';

interface HabitCardProps {
    title: string;
    streak: number;
    completedCount: number;
    weeklyTarget: number;
    category?: 'MAIN' | 'MICRO';
    logs?: { date: string, value: number, metadata?: string }[];
    onToggle: (action: 'increment' | 'decrement') => void;
    onDelete: () => void;
    onLogUpdate?: (date: string, value: number, metadata: any) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
    title,
    streak,
    completedCount,
    weeklyTarget,
    category = 'MAIN',
    logs,
    onToggle,
    onDelete,
    onLogUpdate
}) => {
    const isWater = title.toLowerCase().includes('water');
    const isWake = title.toLowerCase().includes('wake');
    const [wakeTime, setWakeTime] = React.useState({ hour: '', minute: '' });

    React.useEffect(() => {
        if (isWake && logs) {
            const today = new Date().toISOString().split('T')[0];
            const todayLog = logs.find(l => l.date.startsWith(today));
            if (todayLog?.metadata) {
                try {
                    const meta = JSON.parse(todayLog.metadata);
                    if (meta.wakeTime) {
                        setWakeTime(meta.wakeTime);
                    }
                } catch (e) {
                    console.error("Failed to parse metadata", e);
                }
            }
        }
    }, [logs, isWake]);

    const handleWakeTimeChange = (field: 'hour' | 'minute', value: string) => {
        if (field === 'hour') {
            if (value !== '' && (isNaN(Number(value)) || Number(value) < 1 || Number(value) > 12)) return;
        }
        if (field === 'minute') {
            if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 59)) return;
        }
        setWakeTime(prev => ({ ...prev, [field]: value }));
    };

    const handleWakeTimeBlur = () => {
        if (!onLogUpdate) return;
        const today = new Date().toISOString().split('T')[0];
        const todayLog = logs?.find(l => l.date.startsWith(today));

        // Use existing log date or new ISO string
        const dateToUse = todayLog ? todayLog.date : new Date().toISOString();
        // If creating new log, assume value 1 (completed)
        const valueToUse = todayLog ? todayLog.value : 1;

        onLogUpdate(dateToUse, valueToUse, { wakeTime });
    };
    const [waterLevel, setWaterLevel] = React.useState(0);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPress = React.useRef(false);

    // Load water level from local storage with date check
    React.useEffect(() => {
        if (isWater) {
            const today = new Date().toISOString().split('T')[0];
            const savedData = localStorage.getItem(`water-progress-${title}`);

            if (savedData) {
                const { level, date } = JSON.parse(savedData);
                if (date === today) {
                    setWaterLevel(level);
                } else {
                    // New day, reset
                    setWaterLevel(0);
                    localStorage.setItem(`water-progress-${title}`, JSON.stringify({ level: 0, date: today }));
                }
            }
        }
    }, [title, isWater]);

    const handleDrain = () => {
        isLongPress.current = true;

        // If it was full, decrement the habit count
        if (waterLevel >= 100) {
            onToggle('decrement');
        }

        setWaterLevel(0);
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`water-progress-${title}`, JSON.stringify({ level: 0, date: today }));
    };

    const startPress = () => {
        isLongPress.current = false;
        timerRef.current = setTimeout(handleDrain, 800);
    };

    const endPress = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    const handleWaterClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isLongPress.current) return;

        // If already full, do nothing
        if (waterLevel >= 100) return;

        const newLevel = Math.min(waterLevel + 8, 100);
        setWaterLevel(newLevel);

        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`water-progress-${title}`, JSON.stringify({ level: newLevel, date: today }));

        if (newLevel >= 100) {
            // Mark as complete
            onToggle('increment');
            // Do NOT reset water level, keep it full
        }
    };

    // Create an array of length weeklyTarget
    const slots = Array.from({ length: weeklyTarget });

    // Calculate bonus slots
    const bonusCount = Math.max(0, completedCount - weeklyTarget);
    const showBonusSlot = completedCount >= weeklyTarget;
    const totalBonusSlots = showBonusSlot ? bonusCount + 1 : 0;
    const bonusSlots = Array.from({ length: totalBonusSlots });

    const renderSlots = () => (
        <div className="flex flex-wrap gap-2">
            {/* Regular Slots */}
            {slots.map((_, index) => {
                const isFilled = index < completedCount;
                return (
                    <button
                        key={`regular-${index}`}
                        onClick={() => {
                            const action = isFilled ? 'decrement' : 'increment';
                            if (!isFilled && index > completedCount) return;
                            onToggle(action);
                        }}
                        className={`
                            w-8 h-8 border-2 transition-all duration-200
                            ${isFilled
                                ? 'bg-primary border-primary'
                                : 'bg-transparent border-primary hover:bg-primary/20'}
                        `}
                    />
                );
            })}

            {/* Bonus Slots */}
            {bonusSlots.map((_, index) => {
                const actualIndex = weeklyTarget + index;
                const isFilled = actualIndex < completedCount;
                return (
                    <button
                        key={`bonus-${index}`}
                        onClick={() => {
                            const action = isFilled ? 'decrement' : 'increment';
                            if (!isFilled && actualIndex > completedCount) return;
                            onToggle(action);
                        }}
                        className={`
                            w-8 h-8 border-2 border-dashed transition-all duration-200
                            ${isFilled
                                ? 'bg-[#FF4500] border-[#FF4500]' // RAL Orange
                                : 'bg-transparent border-primary hover:bg-primary/20'}
                        `}
                    />
                );
            })}
        </div>
    );

    // Calculate fill height
    const fillHeight = (waterLevel / 100) * 150;
    const clipId = `water-clip-${title.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className={`border-2 border-primary p-4 pb-10 flex flex-col gap-3 transition-all hover:bg-primary/5 group relative ${category === 'MICRO' ? 'bg-[var(--color-muted)] text-background border-transparent' : ''}`}>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="absolute bottom-2 right-2 text-muted hover:text-red-500 transition-colors font-mono text-xs"
            >
                [DEL]
            </button>

            <div className="flex justify-between items-start pr-8">
                <div>
                    <div className="font-bold uppercase tracking-wide text-lg">{title}</div>
                    <div className="text-xs font-mono text-muted mt-1">
                        STREAK: {streak} WEEKS
                    </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                    {isWake && wakeTime.hour && wakeTime.minute && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                    [{completedCount}/{weeklyTarget}]
                </div>
            </div>

            {isWater || isWake ? (
                <div className="flex gap-4">
                    {/* Left side: Slots */}
                    <div className="flex-1 border-r-2 border-primary/20 pr-4 flex flex-col justify-between">
                        {renderSlots()}
                    </div>

                    {/* Right side: Water Drop or Wake Inputs */}
                    <div className="flex-1 flex justify-center items-center">
                        {isWater ? (
                            <button
                                onMouseDown={startPress}
                                onMouseUp={endPress}
                                onMouseLeave={endPress}
                                onTouchStart={startPress}
                                onTouchEnd={endPress}
                                onClick={handleWaterClick}
                                className="relative w-16 h-24 transition-transform active:scale-95 text-primary select-none"
                                title={`Current: ${waterLevel}/100 units (Hold to drain)`}
                            >
                                <svg
                                    viewBox="0 0 105 150"
                                    className="w-full h-full drop-shadow-lg"
                                    style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
                                >
                                    <defs>
                                        <clipPath id={clipId}>
                                            <path
                                                d="M50 0 
                 C50 0 100 60 100 100 
                 C100 127.6 77.6 150 50 150 
                 C22.4 150 0 127.6 0 100 
                 C0 60 50 0 50 0 
                 Z"
                                                transform="translate(2.5 0)"
                                            />
                                        </clipPath>
                                    </defs>

                                    {/* Outline */}
                                    <g transform="translate(2.5 0)">
                                        <path
                                            d="M50 0 
             C50 0 100 60 100 100 
             C100 127.6 77.6 150 50 150 
             C22.4 150 0 127.6 0 100 
             C0 60 50 0 50 0 
             Z"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />
                                    </g>

                                    {/* Fill Rect */}
                                    <rect
                                        x="0"
                                        y={150 - fillHeight}
                                        width="105"
                                        height={150}
                                        fill="currentColor"
                                        clipPath={`url(#${clipId})`}
                                        className="transition-all duration-700 ease-in-out"
                                    />
                                </svg>

                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs font-bold text-primary">
                                    {waterLevel}/100
                                </div>
                            </button>
                        ) : (
                            <div className="flex items-end gap-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-mono text-muted uppercase">Hour</label>
                                    <input
                                        type="text"
                                        value={wakeTime.hour}
                                        onChange={(e) => handleWakeTimeChange('hour', e.target.value)}
                                        onBlur={handleWakeTimeBlur}
                                        placeholder="--"
                                        className="w-12 h-12 bg-transparent border-2 border-primary text-center font-mono text-xl font-bold focus:outline-none focus:bg-primary/10 transition-colors rounded-none placeholder-primary/20"
                                        maxLength={2}
                                    />
                                </div>
                                <span className="text-2xl font-bold pb-2">:</span>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-mono text-muted uppercase">Min</label>
                                    <input
                                        type="text"
                                        value={wakeTime.minute}
                                        onChange={(e) => handleWakeTimeChange('minute', e.target.value)}
                                        onBlur={handleWakeTimeBlur}
                                        placeholder="--"
                                        className="w-12 h-12 bg-transparent border-2 border-primary text-center font-mono text-xl font-bold focus:outline-none focus:bg-primary/10 transition-colors rounded-none placeholder-primary/20"
                                        maxLength={2}
                                    />
                                </div>
                                <span className="text-xl font-bold pb-3 ml-1 text-muted">AM</span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Standard Layout */
                renderSlots()
            )}
        </div>
    );
};
