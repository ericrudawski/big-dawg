import React, { createContext, useContext, useState, useEffect } from 'react';

type AccentMode = 'single' | 'many';

interface AccentColors {
    single: string;
    status: string;
    focus: string;
    bonus: string;
}

interface AccentContextType {
    mode: AccentMode;
    setMode: (mode: AccentMode) => void;
    colors: AccentColors;
    updateColor: (key: keyof AccentColors, value: string) => void;
}

const DEFAULT_ORANGE = '#FF4500';

const defaultColors: AccentColors = {
    single: DEFAULT_ORANGE,
    status: DEFAULT_ORANGE,
    focus: DEFAULT_ORANGE,
    bonus: DEFAULT_ORANGE,
};

const AccentContext = createContext<AccentContextType | undefined>(undefined);

export const AccentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize state from localStorage or defaults
    const [mode, setMode] = useState<AccentMode>(() => {
        const saved = localStorage.getItem('accentColor.mode');
        return (saved === 'single' || saved === 'many') ? saved : 'single';
    });

    const [colors, setColors] = useState<AccentColors>(() => {
        const saved = localStorage.getItem('accentColor.values');
        if (saved) {
            try {
                return { ...defaultColors, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to parse saved accent colors', e);
            }
        }
        return defaultColors;
    });

    // Persist changes
    useEffect(() => {
        localStorage.setItem('accentColor.mode', mode);
    }, [mode]);

    useEffect(() => {
        localStorage.setItem('accentColor.values', JSON.stringify(colors));
    }, [colors]);

    // Update CSS variables
    useEffect(() => {
        const root = document.documentElement;
        if (mode === 'single') {
            root.style.setProperty('--accent-status', colors.single);
            root.style.setProperty('--accent-focus', colors.single);
            root.style.setProperty('--accent-bonus', colors.single);
        } else {
            root.style.setProperty('--accent-status', colors.status);
            root.style.setProperty('--accent-focus', colors.focus);
            root.style.setProperty('--accent-bonus', colors.bonus);
        }
    }, [mode, colors]);

    const updateColor = (key: keyof AccentColors, value: string) => {
        setColors(prev => ({ ...prev, [key]: value }));
    };

    return (
        <AccentContext.Provider value={{ mode, setMode, colors, updateColor }}>
            {children}
        </AccentContext.Provider>
    );
};

export const useAccent = () => {
    const context = useContext(AccentContext);
    if (!context) throw new Error('useAccent must be used within an AccentProvider');
    return context;
};
