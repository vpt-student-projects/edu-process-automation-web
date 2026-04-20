// components/journal/JournalTable.tsx
"use client";

import { memo } from "react";
import { JournalMode } from "@/types/types";
import { JournalDay, todayStr } from "@/hooks/useJournalDays";
import { JournalCell } from "./JournalCell";
import {
    GradesState,
    AttendanceState,
    Grade,
    AttendanceStatus,
} from "@/types/journal";

interface Student {
    id: string;
    name: string;
}

interface Props {
    mode: JournalMode;
    students: ReadonlyArray<Student>;
    currentDays: JournalDay[];
    startDayIndex: number;
    grades: GradesState;
    attendance: AttendanceState;
    onGradeClick: (studentId: string, dayIdx: number) => void;
    onAttendanceClick: (studentId: string, dayIdx: number) => void;
}

interface RowProps {
    mode: JournalMode;
    student: Student;
    currentDays: JournalDay[];
    startDayIndex: number;
    studentGrades?: Record<number, Grade>;
    studentAttendance?: Record<number, AttendanceStatus>;
    onGradeClick: (studentId: string, dayIdx: number) => void;
    onAttendanceClick: (studentId: string, dayIdx: number) => void;
}

const JournalRow = memo(function JournalRow({
    mode,
    student,
    currentDays,
    startDayIndex,
    studentGrades,
    studentAttendance,
    onGradeClick,
    onAttendanceClick,
}: RowProps) {
    return (
        <tr className="hover:bg-background/40 transition-colors group">
            <td className="py-2.5 px-3 text-body text-text sticky left-0 z-10 border-r border-b border-secondary/5 backdrop-blur-2xl bg-background/50 shadow-[4px_0_16px_rgba(0,0,0,0.08)] group-hover:bg-background/70 transition-colors">
                <span className="block max-w-[110px] md:max-w-none truncate md:whitespace-nowrap">
                    {student.name}
                </span>
            </td>
            {currentDays.map((day, relIdx) => {
                const actualIdx = startDayIndex + relIdx;
                const isToday = day.label === todayStr;
                return (
                    <JournalCell
                        key={actualIdx}
                        mode={mode}
                        studentId={student.id}
                        dayIdx={actualIdx}
                        grade={studentGrades?.[actualIdx] ?? null}
                        status={studentAttendance?.[actualIdx] ?? null}
                        isToday={isToday}
                        onGradeClick={onGradeClick}
                        onAttendanceClick={onAttendanceClick}
                    />
                );
            })}
        </tr>
    );
});

export function JournalTable({
    mode,
    students,
    currentDays,
    startDayIndex,
    grades,
    attendance,
    onGradeClick,
    onAttendanceClick,
}: Props) {
    return (
        <table
            className="w-full text-left border-collapse"
            style={{ minWidth: `${200 + currentDays.length * 56}px` }}
        >
            <thead className="sticky top-0 z-20">
                <tr>
                    <th className="p-3 backdrop-blur-2xl bg-background/60 border-b border-r border-secondary/5 text-text/85 text-h6 font-semibold sticky left-0 z-30 shadow-[4px_0_16px_rgba(0,0,0,0.12)] min-w-[120px] md:min-w-[200px]">
                        Студент
                    </th>
                    {currentDays.map((day, i) => {
                        const isToday = day.label === todayStr;
                        const isSat = day.fullDate.getDay() === 6;
                        return (
                            <th
                                key={i}
                                className={`p-2 backdrop-blur-2xl bg-background/60 border-b border-secondary/5 text-center align-bottom min-w-[50px] sm:min-w-[56px] max-w-[60px] ${isToday ? "bg-accent/10" : ""}`}
                            >
                                <div className="flex flex-col items-center justify-end gap-0.5 h-14">
                                    <span
                                        className={`text-caption font-medium ${
                                            isToday
                                                ? "text-accent font-bold"
                                                : isSat
                                                  ? "text-secondary/50"
                                                  : "text-secondary/70"
                                        }`}
                                        style={{
                                            writingMode: "vertical-rl",
                                            transform: "rotate(180deg)",
                                        }}
                                    >
                                        {day.label}
                                    </span>
                                    {isToday && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-0.5 shrink-0" />
                                    )}
                                </div>
                            </th>
                        );
                    })}
                </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
                {students.map((student) => (
                    <JournalRow
                        key={student.id}
                        mode={mode}
                        student={student}
                        currentDays={currentDays}
                        startDayIndex={startDayIndex}
                        studentGrades={grades[student.id]}
                        studentAttendance={attendance[student.id]}
                        onGradeClick={onGradeClick}
                        onAttendanceClick={onAttendanceClick}
                    />
                ))}
            </tbody>
        </table>
    );
}
