import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    email: string;
    name: string;
    theme: string;
    dogPersonality: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.get('/api/auth/me')
                .then(res => {
                    console.log('AuthContext: Fetched user on load', res.data);
                    setUser(res.data);
                })
                .catch(err => {
                    console.error('Failed to fetch user', err);
                    logout();
                });
        } else {
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    }, [token]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!user) return;
        console.log('AuthContext: updateUser called with', updates);
        try {
            const res = await axios.put('/api/auth/me', updates);
            console.log('AuthContext: API response', res.data);
            setUser(res.data);
        } catch (error) {
            console.error('Failed to update user', error);
            throw error;
        }
    };

    useEffect(() => {
        console.log('AuthContext: Theme effect running. User theme:', user?.theme);
        if (user?.theme) {
            const normalizedTheme = user.theme.toLowerCase().replace(/\s+/g, '-');
            console.log('AuthContext: Setting data-theme to', normalizedTheme);
            document.documentElement.setAttribute('data-theme', normalizedTheme);
        } else {
            console.log('AuthContext: Removing data-theme');
            document.documentElement.removeAttribute('data-theme');
        }
    }, [user?.theme]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
