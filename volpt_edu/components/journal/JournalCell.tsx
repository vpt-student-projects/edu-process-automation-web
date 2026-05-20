"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { JournalMode } from "@/types/types";
import {
    Grade,
    AttendanceStatus,
    gradeStyle,
    statusStyle,
} from "@/types/journal";

interface Props {
    mode: JournalMode;
    studentId: string;
    dayIdx: number;
    grade: Grade;
    status: AttendanceStatus;
    isToday: boolean;
    onGradeSelect: (studentId: string, dayIdx: number, grade: Grade) => void;
    onAttendanceSelect: (
        studentId: string,
        dayIdx: number,
        status: AttendanceStatus,
    ) => void;
}

function JournalCellComponent({
    mode,
    studentId,
    dayIdx,
    grade,
    status,
    isToday,
    onGradeSelect,
    onAttendanceSelect,
}: Props) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [menuPosition, setMenuPosition] = useState<{
        top: number;
        left: number;
    } | null>(null);

    const base =
        "inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold border transition-all duration-150 hover:scale-110 active:scale-95";
    const empty =
        "text-primary/15 border-transparent hover:border-primary/10 hover:text-primary/30";

    const content =
        mode === "GRADES" ? (
            <span
                className={`${base} text-sm ${grade ? gradeStyle(grade) : empty}`}
            >
                {grade ?? "·"}
            </span>
        ) : (
            <span
                className={`${base} text-[11px] ${status ? statusStyle(status) : empty}`}
            >
                {status ?? "·"}
            </span>
        );

    const gradeOptions = useMemo(
        () => [
            { value: null as Grade, label: "Удалить отметку", marker: "·" },
            { value: 2 as Grade, label: "Неудовлетворительно", marker: "2" },
            { value: 3 as Grade, label: "Удовлетворительно", marker: "3" },
            { value: 4 as Grade, label: "Хорошо", marker: "4" },
            { value: 5 as Grade, label: "Отлично", marker: "5" },
        ],
        [],
    );

    const attendanceOptions = useMemo(
        () => [
            {
                value: null as AttendanceStatus,
                label: "Удалить отметку",
                marker: "·",
            },
            { value: "НБ" as AttendanceStatus, label: "Не был", marker: "НБ" },
            {
                value: "ОП" as AttendanceStatus,
                label: "Опоздание",
                marker: "ОП",
            },
            {
                value: "УВ" as AttendanceStatus,
                label: "Уважительная причина",
                marker: "УВ",
            },
            {
                value: "УШ" as AttendanceStatus,
                label: "Ушел с пары",
                marker: "УШ",
            },
            {
                value: "ОТ" as AttendanceStatus,
                label: "Отпросился",
                marker: "ОТ",
            },
        ],
        [],
    );

    useEffect(() => {
        function handlePointerDown(event: MouseEvent | PointerEvent) {
            const t = event.target as Node;
            if (rootRef.current?.contains(t)) return;
            if (menuRef.current?.contains(t)) return;
            setOpen(false);
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    useEffect(() => {
        if (!open || !rootRef.current) {
            return;
        }

        const updatePosition = () => {
            const rect = rootRef.current?.getBoundingClientRect();
            if (!rect) return;

            const menuHeight = 220;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            const shouldOpenUp =
                spaceBelow < menuHeight && spaceAbove > menuHeight;

            setMenuPosition({
                top: shouldOpenUp ? rect.top - menuHeight - 6 : rect.bottom + 6,
                left: Math.max(8, rect.right - 208),
            });
        };

        updatePosition();
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open]);

    return (
        <td
            className={`py-2.5 px-1 text-center border-r border-secondary/5 select-none ${isToday ? "bg-accent/5" : ""}`}
        >
            <div className="relative" ref={rootRef}>
                <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    className="touch-manipulation"
                    onClick={() => setOpen((prev) => !prev)}
                >
                    {content}
                </button>
                {open &&
                    menuPosition &&
                    createPortal(
                        <div
                            ref={menuRef}
                            role="listbox"
                            className="fixed z-[100] w-52 rounded-xl border border-secondary/20 bg-background/95 backdrop-blur-xl shadow-xl p-1"
                            style={{
                                top: menuPosition.top,
                                left: menuPosition.left,
                            }}
                        >
                            {(mode === "GRADES"
                                ? gradeOptions
                                : attendanceOptions
                            ).map((option) => (
                                <button
                                    key={`${studentId}-${dayIdx}-${option.marker}-${option.label}`}
                                    type="button"
                                    role="option"
                                    className="w-full px-3 py-2 rounded-lg hover:bg-accent/10 text-left text-xs text-text/90 flex items-center justify-between gap-2"
                                    onClick={() => {
                                        if (mode === "GRADES") {
                                            onGradeSelect(
                                                studentId,
                                                dayIdx,
                                                option.value as Grade,
                                            );
                                        } else {
                                            onAttendanceSelect(
                                                studentId,
                                                dayIdx,
                                                option.value as AttendanceStatus,
                                            );
                                        }
                                        setOpen(false);
                                    }}
                                >
                                    <span className="text-h6 shrink-0">
                                        {option.marker}
                                    </span>
                                    <span className="text-caption">
                                        {option.label}
                                    </span>
                                </button>
                            ))}
                        </div>,
                        document.body,
                    )}
            </div>
        </td>
    );
}

export const JournalCell = memo(JournalCellComponent);
