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

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        setMousePos({
            x: (clientX / innerWidth - 0.5) * 20,
            y: (clientY / innerHeight - 0.5) * 20
        });
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            {/* Grid Background */}
            <div
                className="absolute inset-0 bg-grid-pattern pointer-events-none"
                style={{
                    transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
                    opacity: 0.4
                }}
            ></div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-primary">LOG IN</h1>
                    <div className="h-1 w-24 bg-primary mx-auto"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-background p-8 border-4 border-primary shadow-[8px_8px_0px_0px_rgba(var(--color-primary),1)]">
                    <Input
                        label="USERNAME"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="font-mono uppercase"
                    />
                    <Input
                        label="PASSWORD"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="font-mono uppercase"
                    />
                    <Button type="submit" className="w-full border-2 border-primary hover:bg-primary hover:text-background transition-all uppercase tracking-widest font-bold py-4 rounded-none">
                        LOG IN
                    </Button>
                </form>

                <p className="text-center text-xs font-mono text-muted uppercase tracking-widest">
                    NO ACCOUNT? <Link to="/register" className="text-primary hover:underline font-bold">REGISTER</Link>
                </p>
            </div>
        </div>
    );
};
