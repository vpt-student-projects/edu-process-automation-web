"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeekDates } from "@/hooks/useWeekDates";
import { WeekNavigator } from "@/components/schedule/WeekNavigator";
import { DayCard } from "@/components/schedule/DayCard";
import { buildJournalHref } from "@/lib/journalFilters";
import { loadScheduleTemplate } from "@/lib/services/educationData";
import { PageState } from "@/components/shared/PageState";

export default function SchedulePage() {
    const [weekOffset, setWeekOffset] = useState(0);
    const router = useRouter();
    const { dates, isToday, formatDate, weekRange } = useWeekDates(weekOffset);
    const scheduleResult = useMemo(() => loadScheduleTemplate(), []);
    const scheduleTemplate = scheduleResult.data ?? [];

    const handleLessonSelect = useCallback((subject: string, group: string) => {
        router.push(buildJournalHref({ group, subject }));
    }, [router]);

    return (
        <div className="p-4 md:p-6 w-full mb-24">
            <div className="mb-4 flex   items-center  justify-between  gap-4">
                <div className="pl-2">
                    <h2 className="text-text text-h2 drop-shadow-sm">
                        Расписание
                    </h2>
                    <p className="text-text/85 text-body">
                        Ваше расписание на неделю
                    </p>
                </div>
                <WeekNavigator
                    weekRange={weekRange}
                    onPrev={() => setWeekOffset((p) => p - 1)}
                    onNext={() => setWeekOffset((p) => p + 1)}
                />
            </div>

            {scheduleResult.error ? (
                <PageState
                    title="Расписание недоступно"
                    description={scheduleResult.error.message}
                    variant="error"
                />
            ) : scheduleTemplate.length === 0 ? (
                <PageState
                    title="Расписание пустое"
                    description="Для выбранного периода нет занятий."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scheduleTemplate.map((dayTemplate, index) => (
                        dates[index] ? (
                            <DayCard
                                key={dayTemplate.dayName}
                                dayTemplate={dayTemplate}
                                date={dates[index]}
                                isActive={isToday(dates[index])}
                                formatDate={formatDate}
                                onLessonSelect={handleLessonSelect}
                            />
                        ) : null
                    ))}
                </div>
            )}
        </div>
    );
}
