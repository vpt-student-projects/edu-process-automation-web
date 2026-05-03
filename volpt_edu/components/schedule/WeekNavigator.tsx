import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import {
    iconActionButtonClassName,
    pillActionButtonClassName,
} from "@/components/shared/buttonStyles";

interface Props {
    weekRange: string;
    weekStart: Date;
    onPrev: () => void;
    onNext: () => void;
    onDatePick: (date: Date) => void;
    onToday: () => void;
}

export function WeekNavigator({
    weekRange,
    weekStart,
    onPrev,
    onNext,
    onDatePick,
    onToday,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

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
        const handleReposition = () => {
            updatePosition();
        };
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            if (
                pickerRef.current &&
                !pickerRef.current.contains(target) &&
                triggerRef.current &&
                !triggerRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
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
            <GlassCard
                className="!rounded-full border hover:border-accent "
                intensity="low"
            >
                <div className="flex items-center gap-1 p-2 px-2">
                    <button
                        onClick={onPrev}
                        className={`${iconActionButtonClassName} group`}
                    >
                        <ChevronLeft className="text-text w-5 h-5 group-hover:text-accent " />
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
                        className={`${pillActionButtonClassName} text-body text-center tracking-wide whitespace-nowrap`}
                    >
                        {weekRange}
                    </button>
                    <button
                        onClick={onNext}
                        className={`${iconActionButtonClassName} group`}
                    >
                        <ChevronRight className="text-text w-5 h-5 group-hover:text-accent" />
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
                        <ScheduleCalendar
                            weekStart={weekStart}
                            onToday={onToday}
                            onDatePick={(date) => {
                                onDatePick(date);
                                setIsOpen(false);
                            }}
                        />
                    </div>,
                    document.body,
                )}
        </>
    );
}
