"use client";

import GlassCard from "../GlassCard";
type SkeletonVariant = "default" | "schedule" | "groups" | "journal";

interface Props {
    className?: string;
    rows?: number;
    variant?: SkeletonVariant;
}

export function PageSkeleton({
    className = "",
    rows = 3,
    variant = "default",
}: Props) {
    if (variant === "schedule") {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <GlassCard
                            key={index}
                            className="p-5"
                            intensity="medium"
                        >
                            <div className="animate-pulse space-y-3">
                                <div className="h-5 w-2/3 rounded bg-white/55" />
                                <div className="h-4 w-1/2 rounded bg-white/45" />
                                <div className="space-y-2 pt-2">
                                    <div className="h-10 w-full rounded-lg bg-white/45" />
                                    <div className="h-10 w-full rounded-lg bg-white/40" />
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>
        );
    }

    if (variant === "groups") {
        return (
            <div className={`space-y-5 ${className}`}>
                {Array.from({ length: 3 }).map((_, index) => (
                    <GlassCard key={index} className="p-5" intensity="medium">
                        <div className="animate-pulse space-y-3">
                            <div className="h-5 w-1/3 rounded bg-white/55" />
                            <div className="h-4 w-2/3 rounded bg-white/45" />
                            <div className="grid grid-rows-1 gap-2 pt-1">
                                <div className="h-10 rounded-lg bg-white/40" />
                                <div className="h-10 rounded-lg bg-white/35" />
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        );
    }

    if (variant === "journal") {
        return (
            <div className={`space-y-4 ${className}`}>
                <GlassCard className="p-4" intensity="low">
                    <div className="animate-pulse grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="h-10 rounded-xl bg-white/55" />
                        <div className="h-10 rounded-xl bg-white/50" />
                        <div className="h-10 rounded-xl bg-white/45" />
                    </div>
                </GlassCard>

                <GlassCard className="p-4" intensity="medium">
                    <div className="animate-pulse space-y-3">
                        <div className="h-10 w-full rounded-lg bg-white/45" />
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-9 w-full rounded-lg bg-white/40"
                            />
                        ))}
                    </div>
                </GlassCard>
            </div>
        );
    }

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
