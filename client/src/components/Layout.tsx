import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
    const { user } = useAuth();
    const location = useLocation();

    const navItems = [
        { label: 'TODAY', path: '/' },
        { label: 'STATS', path: '/stats' },
        { label: 'CONFIG', path: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-background text-text flex flex-col font-mono">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-24">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-background border-t-4 border-primary p-4 flex justify-around items-center z-20">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                text-lg font-bold tracking-widest uppercase px-4 py-2 border-2 transition-all
                                ${isActive
                                    ? 'bg-primary text-background border-primary'
                                    : 'text-muted border-transparent hover:border-primary hover:text-primary'}
                            `}
                        >
                            [{item.label}]
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
