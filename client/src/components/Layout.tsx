import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSwipe } from '../hooks/useSwipe';

export const Layout = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { label: 'TODAY', path: '/' },
        { label: 'STATS', path: '/stats' },
        { label: 'CONFIG', path: '/settings' },
    ];

    const currentIndex = navItems.findIndex(item => item.path === location.pathname);

    const handleSwipeLeft = () => {
        if (currentIndex !== -1 && currentIndex < navItems.length - 1) {
            navigate(navItems[currentIndex + 1].path);
        }
    };

    const handleSwipeRight = () => {
        if (currentIndex !== -1 && currentIndex > 0) {
            navigate(navItems[currentIndex - 1].path);
        }
    };

    const swipeHandlers = useSwipe({
        onSwipedLeft: handleSwipeLeft,
        onSwipedRight: handleSwipeRight,
    });

    return (
        <div
            className="min-h-screen bg-background text-text flex flex-col font-mono"
            {...swipeHandlers}
        >
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
