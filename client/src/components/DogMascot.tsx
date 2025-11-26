import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const companionImages: Record<string, string> = {
    'Stoic Wolf': '/wolf_stoic_1763954151078.png',
    'Playful Shepherd': '/shepherd_playful_1763954164736.png',
    'Chill Husky': '/husky_chill_1763954180255.png',
};

export const DogMascot = () => {
    const { user } = useAuth();
    const companionName = user?.dogPersonality || 'Chill Husky';
    const companionImage = companionImages[companionName] || '/husky_chill_1763954180255.png';

    return (
        <div className="flex flex-col items-center my-8">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
            >
                <div className="absolute inset-0 bg-secondary/40 rounded-full blur-3xl scale-110" />
                <div className="relative w-48 h-48 bg-secondary/20 rounded-full flex items-center justify-center">
                    <img
                        src={companionImage}
                        alt={companionName}
                        className="w-40 h-40 object-contain"
                    />
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-6 text-center"
            >
                <h3 className="text-lg font-serif font-semibold text-text">{companionName}</h3>
                <p className="text-sm text-muted mt-1">COMPANION</p>
            </motion.div>
        </div>
    );
};
