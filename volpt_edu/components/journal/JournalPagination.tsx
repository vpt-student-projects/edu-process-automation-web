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
        <div className="flex flex-shrink-0 items-center justify-between gap-2 border-t border-secondary/5 px-2 py-2.5 backdrop-blur-md sm:px-4">
            <button
                onClick={onPrev}
                disabled={page === 0}
                className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-body-sm text-secondary/85 transition-all hover:bg-background/50 disabled:cursor-not-allowed disabled:opacity-25 sm:px-3"
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
                className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-body-sm text-secondary/85 transition-all hover:bg-background/50 disabled:cursor-not-allowed disabled:opacity-25 sm:px-3"
            >
                <span className="hidden sm:inline font-medium">Вперёд</span>
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}
