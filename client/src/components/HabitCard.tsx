import React from 'react';

interface HabitCardProps {
    title: string;
    streak: number;
    completedCount: number;
    weeklyTarget: number;
    onToggle: (action: 'increment' | 'decrement') => void;
    onDelete: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
    title,
    streak,
    completedCount,
    weeklyTarget,
    onToggle,
    onDelete
}) => {
    const isWater = title.toLowerCase().includes('water');
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
        <div className="border-2 border-primary p-4 pb-10 flex flex-col gap-3 transition-all hover:bg-primary/5 group relative">
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
                <div className="font-mono text-xs">
                    [{completedCount}/{weeklyTarget}]
                </div>
            </div>

            {isWater ? (
                <div className="flex gap-4">
                    {/* Left side: Slots */}
                    <div className="flex-1 border-r-2 border-primary/20 pr-4">
                        {renderSlots()}
                    </div>

                    {/* Right side: Water Drop */}
                    <div className="flex-1 flex justify-center items-center">
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
                    </div>
                </div>
            ) : (
                /* Standard Layout */
                renderSlots()
            )}
        </div>
    );
};
