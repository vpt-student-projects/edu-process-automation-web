import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { pillActionButtonClassName } from "@/components/shared/buttonStyles";

interface Props {
    weekStart: Date;
    onDatePick: (date: Date) => void;
    onToday: () => void;
}

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function getMonthGrid(viewDate: Date) {
    const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const monthEnd = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth() + 1,
        0,
    );

    const startOffset = (monthStart.getDay() + 6) % 7;
    const daysInMonth = monthEnd.getDate();
    const cells: Array<Date | null> = [];

    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
}

export function ScheduleCalendar({ weekStart, onDatePick, onToday }: Props) {
    const [viewDate, setViewDate] = useState(new Date());
    const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate]);
    const selectedWeekEnd = useMemo(() => {
        const end = new Date(weekStart);
        end.setDate(weekStart.getDate() + 6);
        return end;
    }, [weekStart]);

    return (
        <GlassCard
            intensity="low"
            className="w-[280px] mt-3 p-3 backdrop-blur-lg"
        >
            <div className="mb-3 flex items-center justify-between">
                <button
                    type="button"
                    className="rounded-full p-1.5 hover:bg-white/35"
                    onClick={() =>
                        setViewDate(
                            (prev) =>
                                new Date(
                                    prev.getFullYear(),
                                    prev.getMonth() - 1,
                                    1,
                                ),
                        )
                    }
                >
                    <ChevronLeft className="h-4 w-4 text-text" />
                </button>
                <span className="text-sm font-medium text-text capitalize">
                    {viewDate.toLocaleDateString("ru-RU", {
                        month: "long",
                        year: "numeric",
                    })}
                </span>
                <button
                    type="button"
                    className="rounded-full p-1.5 hover:bg-white/35"
                    onClick={() =>
                        setViewDate(
                            (prev) =>
                                new Date(
                                    prev.getFullYear(),
                                    prev.getMonth() + 1,
                                    1,
                                ),
                        )
                    }
                >
                    <ChevronRight className="h-4 w-4 text-text" />
                </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-text/75">
                {WEEK_DAYS.map((day) => (
                    <div key={day}>{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {monthGrid.map((date, idx) => {
                    const isInSelectedWeek =
                        !!date && date >= weekStart && date <= selectedWeekEnd;

                    return (
                        <button
                            key={`${date?.toISOString() ?? "empty"}-${idx}`}
                            type="button"
                            disabled={!date}
                            onClick={() => {
                                if (!date) {
                                    return;
                                }

                                onDatePick(date);
                            }}
                            className={`h-8 rounded-full text-sm border transition-colors disabled:opacity-0 ${
                                isInSelectedWeek
                                    ? "bg-accent/20 border-accent/35 text-accent"
                                    : "text-text border-transparent enabled:hover:bg-accent/15 enabled:hover:border-accent/15 enabled:hover:text-accent"
                            }`}
                        >
                            {date?.getDate()}
                        </button>
                    );
                })}
            </div>
            <button
                type="button"
                className={`${pillActionButtonClassName} mt-3 w-full border border-primary/10`}
                onClick={onToday}
            >
                Сегодня
            </button>
        </GlassCard>
    );
}
