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

    // 📍 открытие с позиционированием
    const open = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();

        setPos({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
        });

        setIsOpen(true);
    };

    // ❌ клик вне
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(e.target as Node) &&
                !triggerRef.current?.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEsc);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen]);

    return (
        <>
            <GlassCard className="!rounded-full" intensity="low">
                <div className="flex items-center gap-2 p-2 px-2">
                    <button
                        onClick={onPrev}
                        className="p-2 rounded-full hover:bg-white/15"
                    >
                        <ChevronLeft className="w-5 h-5 text-text" />
                    </button>

                    <button
                        ref={triggerRef}
                        onClick={() => (isOpen ? setIsOpen(false) : open())}
                        className="px-3 py-1.5 rounded-full text-text text-body font-medium text-center tracking-wide whitespace-nowrap hover:bg-white/15 transition-colors"
                    >
                        {weekRange}
                    </button>

                    <button
                        onClick={onNext}
                        className="p-2 rounded-full hover:bg-white/15"
                    >
                        <ChevronRight className="w-5 h-5 text-text" />
                    </button>
                </div>
            </GlassCard>

            {/* 🌐 PORTAL */}
            {isOpen &&
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
                            className="w-[280px] rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl"
                        >
                            {/* header */}
                            <div className="mb-3 flex justify-between items-center">
                                <button
                                    onClick={() =>
                                        setViewDate(
                                            (p) =>
                                                new Date(
                                                    p.getFullYear(),
                                                    p.getMonth() - 1,
                                                    1,
                                                ),
                                        )
                                    }
                                >
                                    <ChevronLeft className="w-4 h-4 text-text" />
                                </button>

                                <span className="text-sm text-text">
                                    {viewDate.toLocaleDateString("ru-RU", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>

                                <button
                                    onClick={() =>
                                        setViewDate(
                                            (p) =>
                                                new Date(
                                                    p.getFullYear(),
                                                    p.getMonth() + 1,
                                                    1,
                                                ),
                                        )
                                    }
                                >
                                    <ChevronRight className="w-4 h-4 text-text" />
                                </button>
                            </div>

                            {/* weekdays */}
                            <div className="grid grid-cols-7 text-xs text-text/70 mb-2">
                                {WEEK_DAYS.map((d) => (
                                    <div key={d} className="text-center">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {monthGrid.map((date, i) => (
                                    <button
                                        key={i}
                                        disabled={!date}
                                        onClick={() => {
                                            if (!date) return;
                                            onDatePick(date);
                                            setIsOpen(false);
                                        }}
                                        className="h-8 rounded-lg text-sm text-text hover:bg-white/15 disabled:opacity-0"
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
