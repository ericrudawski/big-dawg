import React from 'react';
import { useAuth } from '../context/AuthContext';

const themes = [
    {
        id: 'void',
        name: 'VOID',
        colors: ['#000000', '#FFFFFF']
    },
    {
        id: 'concrete',
        name: 'CONCRETE',
        colors: ['#E5E5E5', '#000000']
    },
    {
        id: 'blueprint',
        name: 'BLUEPRINT',
        colors: ['#003366', '#FFFFFF']
    },
];

export const SettingsPage = () => {
    const { user, updateUser } = useAuth();

    const handleThemeChange = async (themeId: string) => {
        console.log('SettingsPage: handleThemeChange called with', themeId);
        try {
            await updateUser({ theme: themeId });
            console.log('SettingsPage: updateUser completed');
        } catch (error) {
            console.error('Failed to update theme');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-12">
            {/* Header */}
            <header className="border-b-4 border-primary pb-4">
                <h1 className="text-4xl font-black uppercase tracking-tighter">
                    SYSTEM<br />CONFIG
                </h1>
            </header>

            {/* Visual Theme */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold uppercase">INTERFACE THEME</h2>
                    <div className="h-px bg-primary flex-1"></div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {themes.map((theme) => {
                        const isSelected = user?.theme === theme.id;
                        return (
                            <button
                                key={theme.id}
                                onClick={() => handleThemeChange(theme.id)}
                                className={`
                                    w-full p-6 border-4 text-left transition-all group relative overflow-hidden
                                    ${isSelected
                                        ? 'border-primary bg-primary text-background'
                                        : 'border-muted text-muted hover:border-primary hover:text-primary'}
                                `}
                            >
                                <div className="flex justify-between items-center relative z-10">
                                    <span className="text-2xl font-black tracking-widest">{theme.name}</span>
                                    {isSelected && <span className="font-mono font-bold">[ACTIVE]</span>}
                                </div>

                                {/* Color Preview Strip */}
                                <div className="absolute bottom-0 left-0 right-0 h-2 flex">
                                    <div className="flex-1" style={{ backgroundColor: theme.colors[0] }}></div>
                                    <div className="flex-1" style={{ backgroundColor: theme.colors[1] }}></div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* System Info */}
            <section className="border-t-2 border-muted/20 pt-8 font-mono text-xs text-muted">
                <p>BIG DAWG PROTOCOL v2.0.0</p>
                <p>SYSTEM ID: {user?.id || 'UNKNOWN'}</p>
            </section>
        </div>
    );
};
