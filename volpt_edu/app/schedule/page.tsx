"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeekDates } from "@/hooks/useWeekDates";
import { WeekNavigator } from "@/components/schedule/WeekNavigator";
import { DayCard } from "@/components/schedule/DayCard";
import { buildJournalHref } from "@/lib/journalFilters";
import {
    loadScheduleTemplateFromApi,
    type ServiceError,
} from "@/lib/services/educationData";
import type { DayTemplate } from "@/types/types";
import { PageState } from "@/components/shared/PageState";

export default function SchedulePage() {
    const [weekOffset, setWeekOffset] = useState(0);
    const [scheduleTemplate, setScheduleTemplate] = useState<
        ReadonlyArray<DayTemplate>
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ServiceError | null>(null);
    const router = useRouter();
    const { dates, isToday, formatDate, weekRange } = useWeekDates(weekOffset);

    useEffect(() => {
        let isMounted = true;

        async function loadSchedule() {
            setLoading(true);
            const result = await loadScheduleTemplateFromApi(dates);

            if (!isMounted) {
                return;
            }

            if (result.error?.code === "UNAUTHORIZED") {
                router.replace("/");
                return;
            }

            setError(result.error);
            setScheduleTemplate(result.data ?? []);
            setLoading(false);
        }

        void loadSchedule();

        return () => {
            isMounted = false;
        };
    }, [router, weekOffset]);

    const handleLessonSelect = useCallback(
        (subject: string, group: string) => {
            router.push(buildJournalHref({ group, subject }));
        },
        [router],
    );

    return (
        <div className="p-4 md:p-6 w-full mb-24">
            <div className="mb-4 flex items-center justify-between gap-4">
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

            {loading ? (
                <PageState
                    title="Загрузка расписания"
                    description="Получаем данные преподавателя с API."
                />
            ) : error ? (
                <PageState
                    title="Расписание недоступно"
                    description={error.message}
                    variant="error"
                />
            ) : scheduleTemplate.every((day) => day.lessons.length === 0) ? (
                <PageState
                    title="Расписание пустое"
                    description="Для выбранного периода нет занятий."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scheduleTemplate.map((dayTemplate, index) => {
                        const date = dates[index];

                        if (!date) {
                            return null;
                        }

                        return (
                            <DayCard
                                key={`${dayTemplate.dayName}-${index}`}
                                dayTemplate={dayTemplate}
                                date={date}
                                isActive={isToday(date)}
                                formatDate={formatDate}
                                onLessonSelect={handleLessonSelect}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
