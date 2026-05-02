import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GlassCard from "@/components/GlassCard";

interface Props {
    weekRange: string;
    onPrev: () => void;
    onNext: () => void;
    onDatePick: (date: Date) => void;
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

export function WeekNavigator({
    weekRange,
    onPrev,
    onNext,
    onDatePick,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [pos, setPos] = useState({ top: 0, left: 0 });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate]);

    const updatePosition = () => {
        if (!triggerRef.current) {
            return;
        }

        const rect = triggerRef.current.getBoundingClientRect();
        const pickerWidth = 280;
        const viewportPadding = 8;

        const centeredLeft =
            rect.left + window.scrollX + rect.width / 2 - pickerWidth / 2;
        const minLeft = window.scrollX + viewportPadding;
        const maxLeft =
            window.scrollX + window.innerWidth - pickerWidth - viewportPadding;

        setPos({
            top: rect.bottom + window.scrollY + 8,
            left: Math.min(Math.max(centeredLeft, minLeft), maxLeft),
        });
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        updatePosition();

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                pickerRef.current?.contains(target) ||
                triggerRef.current?.contains(target)
            ) {
                return;
            }

            setIsOpen(false);
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        const handleReposition = () => {
            updatePosition();
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        window.addEventListener("resize", handleReposition);
        window.addEventListener("scroll", handleReposition, true);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
            window.removeEventListener("resize", handleReposition);
            window.removeEventListener("scroll", handleReposition, true);
        };
    }, [isOpen]);

    return (
        <>
            <GlassCard className="!rounded-full" intensity="low">
                <div className="flex items-center gap-1 p-2 px-2">
                    <button
                        onClick={onPrev}
                        className="p-2 rounded-full hover:bg-white/35 transition-colors"
                    >
                        <ChevronLeft className="text-text w-5 h-5" />
                    </button>
                    <button
                        ref={triggerRef}
                        type="button"
                        onClick={() => {
                            if (!isOpen) {
                                updatePosition();
                            }

                            setIsOpen((prev) => !prev);
                        }}
                        className="text-text text-body font-medium text-center tracking-wide whitespace-nowrap rounded-full px-3 py-1.5 hover:bg-white/35 transition-colors"
                    >
                        {weekRange}
                    </button>
                    <button
                        onClick={onNext}
                        className="p-2 rounded-full hover:bg-white/35 transition-colors"
                    >
                        <ChevronRight className="text-text w-5 h-5" />
                    </button>
                </div>
            </GlassCard>

            {typeof window !== "undefined" &&
                isOpen &&
                createPortal(
                    <div
                        ref={pickerRef}
                        style={{
                            position: "absolute",
                            top: pos.top,
                            left: pos.left,
                            zIndex: 9999,
                        }}
                        className="animate-in fade-in zoom-in-95 duration-150"
                    >
                        <GlassCard
                            intensity="low"
                            className="w-[280px] mt-3 p-3 backdrop-blur-lg border border-accent"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <button
                                    type="button"
                                    className="rounded-full p-1.5 hover:bg-white/15"
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
                                    className="rounded-full p-1.5 hover:bg-white/15"
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
                                {monthGrid.map((date, idx) => (
                                    <button
                                        key={`${date?.toISOString() ?? "empty"}-${idx}`}
                                        type="button"
                                        disabled={!date}
                                        onClick={() => {
                                            if (!date) {
                                                return;
                                            }

                                            onDatePick(date);
                                            setIsOpen(false);
                                        }}
                                        className="h-8 rounded-lg text-sm text-text enabled:hover:bg-white/15 disabled:opacity-0"
                                    >
                                        {date?.getDate()}
                                    </button>
                                ))}
                            </div>
                        </GlassCard>
                    </div>,
                    document.body,
                )}
        </>
    );
}
