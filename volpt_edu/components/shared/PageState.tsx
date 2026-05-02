"use client";

import GlassCard from "../GlassCard";

type PageStateVariant = "empty" | "error";

interface Props {
    title: string;
    description: string;
    variant?: PageStateVariant;
    className?: string;
}

export function PageState({
    title,
    description,
    variant = "empty",
    className = "",
}: Props) {
    const tone =
        variant === "error"
            ? "border-red-400/20 bg-red-500/10 text-red-400"
            : "border-primary/20 bg-primary/10 text-text/90";

    return (
        <GlassCard className={`py-24 text-center ${tone} ${className}`}>
            <h3 className="text-h3 mb-2">{title}</h3>
            <p className="text-body text-text/80">{description}</p>
        </GlassCard>
    );
}
