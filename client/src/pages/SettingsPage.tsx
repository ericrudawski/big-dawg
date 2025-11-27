import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccent } from '../context/AccentContext';

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
    const { user, updateUser, logout } = useAuth();
    const { mode, setMode, colors, updateColor } = useAccent();

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

            {/* Accent Configuration */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold uppercase">ACCENT CONFIGURATION</h2>
                    <div className="h-px bg-primary flex-1"></div>
                </div>

                <div className="space-y-6">
                    {/* Mode Toggle */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setMode('single')}
                            className={`flex-1 p-4 border-2 font-bold transition-all ${mode === 'single' ? 'bg-primary text-background border-primary' : 'bg-transparent text-muted border-muted hover:border-primary hover:text-primary'}`}
                        >
                            SINGLE MODE
                        </button>
                        <button
                            onClick={() => setMode('many')}
                            className={`flex-1 p-4 border-2 font-bold transition-all ${mode === 'many' ? 'bg-primary text-background border-primary' : 'bg-transparent text-muted border-muted hover:border-primary hover:text-primary'}`}
                        >
                            MANY MODE
                        </button>
                    </div>

                    {/* Color Pickers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {mode === 'single' ? (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-mono text-muted uppercase">Global Accent</label>
                                <div className="flex items-center justify-between gap-4 border-2 border-muted p-2 hover:border-primary transition-colors">
                                    <span className="font-mono text-sm">{colors.single.toUpperCase()}</span>
                                    <input
                                        type="color"
                                        value={colors.single}
                                        onChange={(e) => updateColor('single', e.target.value)}
                                        className="w-12 h-12 p-0 border-0 cursor-pointer bg-transparent rounded-none"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-mono text-muted uppercase">Status Indicator</label>
                                    <div className="flex items-center justify-between gap-4 border-2 border-muted p-2 hover:border-primary transition-colors">
                                        <span className="font-mono text-sm">{colors.status.toUpperCase()}</span>
                                        <input
                                            type="color"
                                            value={colors.status}
                                            onChange={(e) => updateColor('status', e.target.value)}
                                            className="w-12 h-12 p-0 border-0 cursor-pointer bg-transparent rounded-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-mono text-muted uppercase">Focus Habit Border</label>
                                    <div className="flex items-center justify-between gap-4 border-2 border-muted p-2 hover:border-primary transition-colors">
                                        <span className="font-mono text-sm">{colors.focus.toUpperCase()}</span>
                                        <input
                                            type="color"
                                            value={colors.focus}
                                            onChange={(e) => updateColor('focus', e.target.value)}
                                            className="w-12 h-12 p-0 border-0 cursor-pointer bg-transparent rounded-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-mono text-muted uppercase">Bonus Slots</label>
                                    <div className="flex items-center justify-between gap-4 border-2 border-muted p-2 hover:border-primary transition-colors">
                                        <span className="font-mono text-sm">{colors.bonus.toUpperCase()}</span>
                                        <input
                                            type="color"
                                            value={colors.bonus}
                                            onChange={(e) => updateColor('bonus', e.target.value)}
                                            className="w-12 h-12 p-0 border-0 cursor-pointer bg-transparent rounded-none"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Logout Bar */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold uppercase">USER</h2>
                    <div className="h-px bg-primary flex-1"></div>
                </div>
                <button
                    onClick={logout}
                    className="w-full p-4 border-2 border-muted text-muted hover:border-primary hover:text-primary transition-all uppercase font-bold tracking-widest"
                >
                    LOG OUT
                </button>
            </section>

            {/* System Info */}
            <section className="border-t-2 border-muted/20 pt-8 font-mono text-xs text-muted">
                <p>KEEP GOING.</p>
                <p>SYSTEM ID: {user?.id || 'UNKNOWN'}</p>
            </section>
        </div>
    );
};
