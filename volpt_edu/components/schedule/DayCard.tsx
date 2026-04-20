"use client";

import { memo, useMemo } from "react";
import GlassCard from "@/components/GlassCard";
import { LessonCard } from "./LessonCard";
import type { DayTemplate } from "@/types/types";

interface Props {
    dayTemplate: DayTemplate;
    date: Date;
    isActive: boolean;
    formatDate: (d: Date) => string;
    onLessonSelect: (subject: string, group: string) => void;
}

function DayCardComponent({
    dayTemplate,
    date,
    isActive,
    formatDate,
    onLessonSelect,
}: Props) {
    const sorted = useMemo(
        () =>
            [...dayTemplate.lessons].sort(
                (a, b) => a.pairNumber - b.pairNumber,
            ),
        [dayTemplate.lessons],
    );

    return (
        <GlassCard
            className={`flex flex-col h-full !rounded-[1.5rem] ${isActive ? "!border-accent/85 shadow-accent/55" : ""}`}
            intensity="medium"
        >
            <div className="p-5 border-b border-primary/[0.1]">
                <div className="flex justify-between items-center">
                    <h3 className="text-text text-h5 tracking-tight">
                        {dayTemplate.dayName}
                    </h3>
                    <span
                        className={`text-body-sm font-semibold px-3 py-1 rounded-full border ${
                            isActive
                                ? "bg-accent text-background border-accent"
                                : "bg-primary/[0.05] border-primary/15 text-text/85"
                        }`}
                    >
                        {formatDate(date)}
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-3 flex-1">
                {sorted.length > 0 ? (
                    sorted.map((lesson) => (
                        <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            onClick={() =>
                                onLessonSelect(lesson.subject, lesson.group)
                            }
                        />
                    ))
                ) : (
                    <div className="h-full flex items-center justify-center text-text/50 italic text-sm min-h-[100px]">
                        Нет предметов
                    </div>
                )}
            </div>
        </GlassCard>
    );
}

export const DayCard = memo(DayCardComponent);
