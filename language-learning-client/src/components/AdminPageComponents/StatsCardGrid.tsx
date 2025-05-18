import React from "react";

interface Stats {
    totalUsers: number;
    totalDecks: number;
    activeUsers: number;
    totalCards: number;
}

interface StatsCardGridProps {
    stats: Stats;
}

export const StatsCardGrid: React.FC<StatsCardGridProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1">
            
        </div>
    )
}