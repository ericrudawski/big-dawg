import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ className, label, ...props }) => {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-sm font-medium text-muted">{label}</label>}
            <input
                className={twMerge(
                    "px-4 py-2 rounded-lg border border-muted/30 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
                    className
                )}
                {...props}
            />
        </div>
    );
};
