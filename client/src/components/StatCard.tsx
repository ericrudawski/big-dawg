import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
    return (
        <div className="border-2 border-primary p-4 hover:bg-primary hover:text-background transition-colors group cursor-default">
            <div className="text-xs font-mono uppercase tracking-widest mb-2 text-muted group-hover:text-background/70">{label}</div>
            <div className="text-4xl font-black tracking-tighter">{value}</div>
        </div>
    );
};
