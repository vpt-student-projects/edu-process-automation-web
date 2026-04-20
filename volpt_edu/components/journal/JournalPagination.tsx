// components/journal/JournalPagination.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { JournalDay } from "@/hooks/useJournalDays";

interface Props {
    page: number;
    totalPages: number;
    currentDays: JournalDay[];
    onPrev: () => void;
    onNext: () => void;
}

export function JournalPagination({
    page,
    totalPages,
    currentDays,
    onPrev,
    onNext,
}: Props) {
    return (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-secondary/5 backdrop-blur-md">
            <button
                onClick={onPrev}
                disabled={page === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-secondary/85 hover:bg-background/50 disabled:opacity-25 disabled:cursor-not-allowed transition-all text-body-sm"
            >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Назад</span>
            </button>

            <div className="flex items-center gap-2">
                <span className="text-caption text-primary/40 hidden sm:inline">
                    {currentDays[0]?.label} —{" "}
                    {currentDays[currentDays.length - 1]?.label}
                </span>
                <span className="text-body-sm font-bold text-accent/85 bg-background/85 px-4 py-1 rounded-full border border-primary/15">
                    {page + 1} / {totalPages}
                </span>
            </div>

            <button
                onClick={onNext}
                disabled={page === totalPages - 1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-secondary/85 hover:bg-background/50 disabled:opacity-25 disabled:cursor-not-allowed transition-all text-body-sm"
            >
                <span className="hidden sm:inline font-medium">Вперёд</span>
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
