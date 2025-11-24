import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [dogName, setDogName] = useState('');
    const [themeChoice, setThemeChoice] = useState('golden');

    const { login } = useAuth();
    const { setTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', {
                email, password, name, dogName, theme: themeChoice
            });
            login(res.data.token, res.data.user);
            // @ts-ignore
            setTheme(themeChoice);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-serif text-primary mb-2">Join the Pack</h1>
                    <p className="text-muted">Start your journey with a loyal companion.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 rounded-2xl shadow-sm border border-muted/10">
                    <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Input label="Dog's Name" value={dogName} onChange={(e) => setDogName(e.target.value)} required />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted">Choose your companion</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['golden', 'dalmatian', 'husky', 'shiba'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setThemeChoice(t)}
                                    className={`p - 2 rounded - lg border text - sm capitalize ${themeChoice === t ? 'border-primary bg-primary/10 text-primary' : 'border-muted/30'
                                        } `}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" className="w-full">Register</Button>
                </form>

                <p className="text-center text-sm text-muted">
                    Already have a pack? <Link to="/login" className="text-primary hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};
