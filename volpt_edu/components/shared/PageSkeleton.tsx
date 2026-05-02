"use client";

import GlassCard from "../GlassCard";

interface Props {
    className?: string;
    rows?: number;
    cols?: number;
}

export function PageSkeleton({ className = "", rows = 3, cols = 1 }: Props) {
    return (
        <GlassCard className={`p-6 ${className}`}>
            <div className="animate-pulse space-y-3">
                <div className="h-6 w-1/3 rounded bg-white/60" />
                <div className="h-4 w-2/3 rounded bg-white/55" />
                {Array.from({ length: rows }).map((_, index) => (
                    <div
                        key={index}
                        className="h-12 w-full rounded-lg bg-white/50"
                    />
                ))}
            </div>
        </GlassCard>
    );
}
