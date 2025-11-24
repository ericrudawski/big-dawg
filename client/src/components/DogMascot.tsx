import React from 'react';
import { motion } from 'framer-motion';

export const DogMascot = () => {
    return (
        <div className="relative w-48 h-48 mx-auto my-8">
            <motion.svg
                viewBox="0 0 200 200"
                className="w-full h-full drop-shadow-xl"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Simple geometric dog face */}
                <circle cx="100" cy="100" r="80" className="fill-secondary" />
                <path d="M60 80 L80 120 L100 80" className="fill-text opacity-80" /> {/* Left Eye */}
                <path d="M140 80 L120 120 L100 80" className="fill-text opacity-80" /> {/* Right Eye */}
                <path d="M90 130 Q100 140 110 130" className="stroke-text fill-none stroke-4" /> {/* Nose */}
                <path d="M40 60 L60 20 L80 60" className="fill-primary" /> {/* Left Ear */}
                <path d="M160 60 L140 20 L120 60" className="fill-primary" /> {/* Right Ear */}
            </motion.svg>

            {/* Speech Bubble */}
            <motion.div
                className="absolute -top-4 -right-4 bg-surface p-3 rounded-xl shadow-lg border border-muted/10 max-w-[150px]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
            >
                <p className="text-xs font-serif italic text-text">"Keep it up, boss!"</p>
            </motion.div>
        </div>
    );
};
