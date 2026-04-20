// app/journal/page.tsx
"use client";

import { useState, useCallback, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import { JournalMode } from "@/types/types";
import { JOURNAL_DAYS, TODAY_INDEX } from "@/hooks/useJournalDays";
import {
    GradesState,
    AttendanceState,
    nextGrade,
    nextStatus,
} from "@/types/journal";
import { JournalFilters } from "@/components/journal/JournalFilters";
import { ModeToggle } from "@/components/journal/ModeToggle";
import { JournalTable } from "@/components/journal/JournalTable";
import { JournalPagination } from "@/components/journal/JournalPagination";
import {
    normalizeJournalFilters,
    buildJournalHref,
} from "@/lib/journalFilters";
import { loadStudents } from "@/lib/services/educationData";
import { PageState } from "@/components/shared/PageState";

const ITEMS_PER_PAGE = 18;

function JournalContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialFilters = normalizeJournalFilters(
        searchParams.get("group"),
        searchParams.get("subject"),
    );

    const [mode, setMode] = useState<JournalMode>("ATTENDANCE");
    const [selectedGroup, setSelectedGroup] = useState(initialFilters.group);
    const [selectedSubject, setSelectedSubject] = useState(
        initialFilters.subject,
    );
    const [page, setPage] = useState(() =>
        TODAY_INDEX >= 0 ? Math.floor(TODAY_INDEX / ITEMS_PER_PAGE) : 0,
    );
    const [grades, setGrades] = useState<GradesState>({});
    const [attendance, setAttendance] = useState<AttendanceState>({});
    const studentsResult = useMemo(() => loadStudents(), []);
    const students = studentsResult.data ?? [];

    const totalPages = Math.ceil(JOURNAL_DAYS.length / ITEMS_PER_PAGE);
    const startDayIndex = page * ITEMS_PER_PAGE;
    const currentDays = useMemo(
        () =>
            JOURNAL_DAYS.slice(startDayIndex, startDayIndex + ITEMS_PER_PAGE),
        [startDayIndex],
    );

    const updateFilters = useCallback((group: string, subject: string) => {
        const normalized = normalizeJournalFilters(group, subject);
        setSelectedGroup(normalized.group);
        setSelectedSubject(normalized.subject);
        router.replace(buildJournalHref(normalized));
    }, [router]);

    const handleGradeClick = useCallback(
        (studentId: string, dayIdx: number) => {
            setGrades((prev) => ({
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    [dayIdx]: nextGrade(prev[studentId]?.[dayIdx] ?? null),
                },
            }));
        },
        [],
    );

    const handleAttendanceClick = useCallback(
        (studentId: string, dayIdx: number) => {
            setAttendance((prev) => ({
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    [dayIdx]: nextStatus(prev[studentId]?.[dayIdx] ?? null),
                },
            }));
        },
        [],
    );

    return (
        <div className="flex flex-col p-4 md:p-6 mx-auto w-full gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="pl-2 min-w-0 overflow-hidden">
                    <h2 className="text-text text-h2 drop-shadow-sm">Журнал</h2>
                    <div className="flex items-baseline gap-1 text-body overflow-hidden">
                        <span className="text-text/85 whitespace-nowrap shrink-0">
                            Посещаемость и оценки
                        </span>
                        <span className="text-text/40 shrink-0">·</span>
                        <span
                            className="text-accent/85 truncate"
                            title={`${selectedSubject} · ${selectedGroup}`}
                        >
                            {selectedSubject} · {selectedGroup}
                        </span>
                    </div>
                </div>
                <div className="shrink-0">
                    <ModeToggle mode={mode} onChange={setMode} />
                </div>
            </div>

            <JournalFilters
                selectedGroup={selectedGroup}
                selectedSubject={selectedSubject}
                onChange={updateFilters}
            />

            <GlassCard
                className="flex-1 overflow-hidden flex flex-col min-h-0  mb-24"
                intensity="medium"
            >
                {studentsResult.error ? (
                    <div className="p-4">
                        <PageState
                            title="Ошибка загрузки журнала"
                            description={studentsResult.error.message}
                            variant="error"
                        />
                    </div>
                ) : students.length === 0 ? (
                    <div className="p-4">
                        <PageState
                            title="Журнал пока пуст"
                            description="Для выбранных фильтров нет студентов. Измените группу или предмет."
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto min-h-0 custom-scrollbar">
                            <JournalTable
                                mode={mode}
                                students={students}
                                currentDays={currentDays}
                                startDayIndex={startDayIndex}
                                grades={grades}
                                attendance={attendance}
                                onGradeClick={handleGradeClick}
                                onAttendanceClick={handleAttendanceClick}
                            />
                        </div>
                        <JournalPagination
                            page={page}
                            totalPages={totalPages}
                            currentDays={currentDays}
                            onPrev={() => setPage((p) => Math.max(0, p - 1))}
                            onNext={() =>
                                setPage((p) => Math.min(totalPages - 1, p + 1))
                            }
                        />
                    </>
                )}
            </GlassCard>
        </div>
    );
}

export default function JournalPage() {
    return (
        <Suspense
            fallback={<div className="p-6 text-text">Загрузка журнала...</div>}
        >
            <JournalContent />
        </Suspense>
    );
}
