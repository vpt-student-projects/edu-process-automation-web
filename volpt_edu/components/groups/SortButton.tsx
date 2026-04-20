"use client";

import GlassCard from "@/components/GlassCard";
import { ArrowDownAZ, SortAsc } from "lucide-react";
import { SortOption } from "@/types/types";

interface Props {
    sortBy: SortOption;
    onToggle: () => void;
}

export function SortButton({ sortBy, onToggle }: Props) {
    return (
        <GlassCard
            intensity="low"
            className="w-fit group hover:bg-primary/10 border px-4 py-2 border-primary/5 hover:border-accent/55 transition-colors"
        >
            <button
                onClick={onToggle}
                className="flex items-center gap-2 group-hover:text-accent text-text text-body-sm font-medium transition-colors"
            >
                {sortBy === "NAME" ? (
                    <ArrowDownAZ className="w-4 h-4" />
                ) : (
                    <SortAsc className="w-4 h-4" />
                )}
                {sortBy === "NAME" ? "Имя" : "Кол-во предметов"}
            </button>
        </GlassCard>
    );
}
