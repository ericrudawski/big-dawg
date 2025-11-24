import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, List, MessageCircle, FileText, Settings, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
    const { user } = useAuth();
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: List, label: 'Habits', path: '/habits' },
        { icon: MessageCircle, label: 'Chat', path: '/chat' },
        { icon: FileText, label: 'Sheets', path: '/sheets' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-background text-text flex flex-col">
            <header className="p-4 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-muted/10">
                <h1 className="text-xl font-serif font-bold text-primary">Big Dawg</h1>
                <div className="text-sm font-medium">{user?.name}</div>
            </header>

            <main className="flex-1 p-4 pb-24 max-w-md mx-auto w-full">
                <Outlet />
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-muted/10 px-6 py-3 flex justify-between items-center z-20 safe-area-pb">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-muted'}`}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
