import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            login(res.data.token, res.data.user);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-serif text-primary mb-2">Big Dawg</h1>
                    <p className="text-muted">Welcome back, human.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 rounded-2xl shadow-sm border border-muted/10">
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" className="w-full">Login</Button>
                </form>

                <p className="text-center text-sm text-muted">
                    Don't have a dog yet? <Link to="/register" className="text-primary hover:underline">Adopt one</Link>
                </p>
            </div>
        </div>
    );
};
