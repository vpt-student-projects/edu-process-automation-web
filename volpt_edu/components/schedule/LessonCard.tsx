"use client";

import { Clock, MapPin } from "lucide-react";
import { TIME_SLOTS } from "@/constants";
import type { Lesson } from "@/types/types";

interface Props {
    lesson: Lesson;
    onClick: () => void;
}

function getTimeString(pairNumber: number): string {
    const slot = TIME_SLOTS.find((t) => t.id === pairNumber);
    return slot?.time.split(" - ")[0] ?? "TBA";
}

export function LessonCard({ lesson, onClick }: Props) {
    return (
        <div
            onClick={onClick}
            className="group relative overflow-hidden rounded-xl
                bg-primary/[0.05] hover:bg-accent/[0.8]
                border border-primary/15
                 p-3 transition-colors duration-200 cursor-pointer touch-manipulation"
        >
            <div className="absolute top-3 right-3 text-caption text-text/85 group-hover:text-background/85">
                №{lesson.pairNumber}
            </div>

            <div className="flex justify-between items-start mb-2 pr-5">
                <span className="text-text text-h6 group-hover:text-background transition-colors line-clamp-2 drop-shadow-sm">
                    {lesson.subject}
                </span>
            </div>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-caption bg-accent/10 text-accent group-hover:text-background group-hover:border-background/70 px-2 py-0.5 rounded  border border-accent backdrop-blur-sm">
                    {lesson.group}
                </span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm">
                    <span className="flex items-center gap-1 text-text/85 group-hover:text-background/85">
                        <MapPin className="w-4 h-4 text-accent group-hover:text-background" />
                        {lesson.room}
                    </span>
                    <span className="flex items-center gap-1 text-text/85 group-hover:text-background/85">
                        <Clock className="w-4 h-4 text-accent group-hover:text-background" />
                        {getTimeString(lesson.pairNumber)}
                    </span>
                </div>
            </div>
        </div>
    );
}
