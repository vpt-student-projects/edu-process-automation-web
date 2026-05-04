"use client";

import GlassCard from "@/components/GlassCard";
import { ArrowDownAZ, SortAsc } from "lucide-react";
import { SortOption } from "@/types/types";
import { pillActionButtonClassName } from "@/components/shared/buttonStyles";

interface Props {
    sortBy: SortOption;
    onToggle: () => void;
}

export function SortButton({ sortBy, onToggle }: Props) {
    return (
        <GlassCard
            intensity="low"
            className="w-fit group hover:bg-accent/15 border px-4 py-2 border-primary/5 hover:border-accent/55 transition-colors"
        >
            <button
                onClick={onToggle}
                className={`${pillActionButtonClassName} flex items-center gap-2 !px-0 !py-0 text-body-sm group-hover:text-accent hover:bg-transparent`}
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
