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
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { getStoredUser, isAdminRole } from "@/lib/auth/session";

export default function SchedulePage() {
    const [weekOffset, setWeekOffset] = useState(0);
    const [scheduleTemplate, setScheduleTemplate] = useState<
        ReadonlyArray<DayTemplate>
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ServiceError | null>(null);
    const router = useRouter();
    const { dates, isToday, formatDate, weekRange, weekStart } =
        useWeekDates(weekOffset);

    useEffect(() => {
        const user = getStoredUser();
        if (isAdminRole(user?.role)) {
            router.replace("/admin");
        }
    }, [router]);

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
    const handleDatePick = useCallback((selectedDate: Date) => {
        const today = new Date();
        const selected = new Date(selectedDate);

        selected.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const selectedDay = selected.getDay();
        const mondayOffset = selectedDay === 0 ? -6 : 1 - selectedDay;
        selected.setDate(selected.getDate() + mondayOffset);

        const todayDay = today.getDay();
        const todayMondayOffset = todayDay === 0 ? -6 : 1 - todayDay;
        today.setDate(today.getDate() + todayMondayOffset);

        const msInWeek = 1000 * 60 * 60 * 24 * 7;
        const offset = Math.round(
            (selected.getTime() - today.getTime()) / msInWeek,
        );

        setWeekOffset(offset);
    }, []);

    return (
        <div className="p-4 md:p-6 w-full mb-24">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="pl-2 flex items-center gap-3">
                    <svg
                        className="w-[120px] md:w-[100px] sm:w-[80px] h-auto  flex-shrink-0"
                        viewBox="0 0 88 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M86 27.1709V18.3411C86 18.1148 85.8628 17.9099 85.6506 17.8195L71.5814 11.8232C71.5079 11.7919 71.4288 11.7758 71.3487 11.7758H59.7018C59.3803 11.7758 59.1196 11.5211 59.1196 11.2068V8.27525C59.1196 7.96103 59.3803 7.70628 59.7018 7.70628H59.8088C60.1303 7.70628 60.391 7.45154 60.391 7.13731V6.59585C60.391 6.40532 60.4886 6.22743 60.6509 6.12197L60.6906 6.09634C60.8438 5.99677 60.9359 5.82883 60.9359 5.64894C60.9359 5.4023 60.7641 5.18734 60.5192 5.1277L43.6401 1.01689C43.5481 0.994484 43.4518 0.99437 43.3599 1.01655L26.2998 5.12858C26.0548 5.18767 25.8825 5.4026 25.8825 5.64937C25.8825 5.82899 25.9745 5.99668 26.1275 6.0961L26.1674 6.12197C26.3298 6.22743 26.4274 6.40532 26.4274 6.59585V7.13731C26.4274 7.45154 26.688 7.70628 27.0096 7.70628H27.1166C27.4381 7.70628 27.6987 7.96103 27.6987 8.27525V11.2068C27.6987 11.5211 27.4381 11.7758 27.1166 11.7758H15.8347C15.7535 11.7758 15.6731 11.7924 15.5989 11.8245L1.34641 17.9954C1.1358 18.0866 1 18.2906 1 18.5156V27.1728C1 27.4703 1.23433 27.7175 1.53765 27.7401L15.1666 28.7615H22.7575C23.0791 28.7615 23.3397 29.0162 23.3397 29.3305V29.4311C23.3397 29.7453 23.6004 30 23.9219 30H38.2335C38.3335 30 38.4146 29.9208 38.4146 29.8231C38.4146 29.7254 38.4956 29.6461 38.5956 29.6461H47.4963C47.5963 29.6461 47.6774 29.7254 47.6774 29.8231C47.6774 29.9208 47.7584 30 47.8584 30H62.7148C63.0363 30 63.2971 29.7453 63.2971 29.4311V29.3305C63.2971 29.0162 63.5577 28.7615 63.8792 28.7615H71.1068L85.4602 27.7384C85.7644 27.7167 86 27.4691 86 27.1709Z"
                            stroke="#050f1a"
                            strokeWidth="2"
                        />
                        <path
                            d="M59.0736 20.8967V8.09497H27.708V20.8967H59.0736Z"
                            stroke="#050f1a"
                            strokeWidth="2"
                        />
                        <path
                            d="M31.7502 8.43213H33.6139V20.5093H31.7502V8.43213Z"
                            fill="#050f1a"
                        />
                        <path
                            d="M37.3411 8.43213H39.2047V20.5093H37.3411V8.43213Z"
                            fill="#050f1a"
                        />
                        <path
                            d="M42.9321 8.43213H44.7958V20.5093H42.9321V8.43213Z"
                            fill="#050f1a"
                        />
                        <path
                            d="M48.5229 8.43213H50.3867V20.5093H48.5229V8.43213Z"
                            fill="#050f1a"
                        />
                        <path
                            d="M54.114 8.43213H55.9777V20.5093H54.114V8.43213Z"
                            fill="#050f1a"
                        />
                        <path
                            d="M60.5738 25.8364V21.4655C60.5738 21.1513 60.3131 20.8965 59.9916 20.8965H26.6437C26.3221 20.8965 26.0615 21.1513 26.0615 21.4655V25.8364M60.5738 25.8364H26.0615M60.5738 25.8364H62.7125C63.034 25.8364 63.2947 26.091 63.2947 26.4054V29.431C63.2947 29.7452 63.034 30 62.7125 30H23.924C23.6024 30 23.3418 29.7452 23.3418 29.431V26.4054C23.3418 26.091 23.6024 25.8364 23.924 25.8364H26.0615"
                            stroke="#050f1a"
                            strokeWidth="2"
                        />
                    </svg>
                    <div>
                        <h2 className="text-text text-h2 drop-shadow-sm">
                            Расписание
                        </h2>
                        <p className="text-text/85 text-body">
                            Ваше расписание на неделю
                        </p>
                    </div>
                </div>
                <WeekNavigator
                    weekRange={weekRange}
                    weekStart={weekStart}
                    onPrev={() => setWeekOffset((p) => p - 1)}
                    onNext={() => setWeekOffset((p) => p + 1)}
                    onDatePick={handleDatePick}
                    onToday={() => setWeekOffset(0)}
                />
            </div>

            {loading ? (
                <PageSkeleton variant="schedule" />
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
