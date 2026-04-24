"use client";

import { useState, useCallback, Suspense, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import { JournalMode } from "@/types/types";
import { JOURNAL_DAYS, TODAY_INDEX } from "@/hooks/useJournalDays";
import {
    GradesState,
    AttendanceState,
    nextGrade,
    nextStatus,
    type AttendanceStatus,
} from "@/types/journal";
import { JournalFilters } from "@/components/journal/JournalFilters";
import { ModeToggle } from "@/components/journal/ModeToggle";
import { JournalTable } from "@/components/journal/JournalTable";
import { JournalPagination } from "@/components/journal/JournalPagination";
import { buildJournalHref } from "@/lib/journalFilters";
import {
    loadJournalFiltersFromApi,
    loadJournalDataFromApi,
    mapAttendanceTypeNameToStatus,
    saveAttendanceToApi,
    saveGradeToApi,
    type JournalAttendanceType,
    type JournalFiltersData,
    type ServiceError,
} from "@/lib/services/educationData";
import { PageState } from "@/components/shared/PageState";

const ITEMS_PER_PAGE = 18;

function toApiDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function toJournalLabel(date: string): string {
    const [year, month, day] = date.split("-");
    void year;
    return `${day}.${month}`;
}

function getAttendanceTypeIdByStatus(
    attendanceTypes: ReadonlyArray<JournalAttendanceType>,
    status: AttendanceStatus,
): number | null {
    if (!status) {
        return null;
    }

    const match = attendanceTypes.find(
        (type) => type.name.trim().toLowerCase() === status.toLowerCase(),
    );

    return match?.id ?? null;
}

function JournalContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [mode, setMode] = useState<JournalMode>("ATTENDANCE");
    const [page, setPage] = useState(() =>
        TODAY_INDEX >= 0 ? Math.floor(TODAY_INDEX / ITEMS_PER_PAGE) : 0,
    );
    const [filtersData, setFiltersData] = useState<JournalFiltersData | null>(
        null,
    );
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [grades, setGrades] = useState<GradesState>({});
    const [attendance, setAttendance] = useState<AttendanceState>({});
    const [students, setStudents] = useState<ReadonlyArray<{ id: string; name: string }>>(
        [],
    );
    const [lessonIdsByDay, setLessonIdsByDay] = useState<Record<number, number>>(
        {},
    );
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [loadingJournal, setLoadingJournal] = useState(true);
    const [error, setError] = useState<ServiceError | null>(null);

    const totalPages = Math.ceil(JOURNAL_DAYS.length / ITEMS_PER_PAGE);
    const startDayIndex = page * ITEMS_PER_PAGE;
    const currentDays = useMemo(
        () => JOURNAL_DAYS.slice(startDayIndex, startDayIndex + ITEMS_PER_PAGE),
        [startDayIndex],
    );

    const selectedGroupData = useMemo(
        () =>
            filtersData?.groups.find((group) => group.groupName === selectedGroup) ??
            null,
        [filtersData, selectedGroup],
    );

    const availableSubjects = selectedGroupData?.subjects ?? [];

    useEffect(() => {
        let isMounted = true;

        async function loadFilters() {
            setLoadingFilters(true);
            const result = await loadJournalFiltersFromApi();

            if (!isMounted) {
                return;
            }

            if (result.error?.code === "UNAUTHORIZED") {
                router.replace("/");
                return;
            }

            if (result.error) {
                setError(result.error);
                setLoadingFilters(false);
                return;
            }

            const data = result.data;
            const requestedGroup = searchParams.get("group");
            const initialGroup =
                data.groups.find((group) => group.groupName === requestedGroup) ??
                data.groups[0] ??
                null;
            const requestedSubject = searchParams.get("subject");
            const initialSubject =
                initialGroup?.subjects.find(
                    (subject) => subject.subjectName === requestedSubject,
                ) ??
                initialGroup?.subjects[0] ??
                null;

            setFiltersData(data);
            setSelectedGroup(initialGroup?.groupName ?? "");
            setSelectedSubject(initialSubject?.subjectName ?? "");
            setLoadingFilters(false);
        }

        void loadFilters();

        return () => {
            isMounted = false;
        };
    }, [router, searchParams]);

    useEffect(() => {
        if (!filtersData) {
            return;
        }

        const requestedGroup = filtersData.groups.find(
            (group) => group.groupName === selectedGroup,
        );
        const nextGroup = requestedGroup ?? filtersData.groups[0] ?? null;
        const nextSubject =
            nextGroup?.subjects.find(
                (subject) => subject.subjectName === selectedSubject,
            ) ??
            nextGroup?.subjects[0] ??
            null;

        if (!nextGroup || !nextSubject) {
            return;
        }

        router.replace(
            buildJournalHref({
                group: nextGroup.groupName,
                subject: nextSubject.subjectName,
            }),
        );
    }, [filtersData, router, selectedGroup, selectedSubject]);

    useEffect(() => {
        if (!selectedGroupData) {
            return;
        }

        const groupData = selectedGroupData;
        const selectedSubjectData =
            groupData.subjects.find(
                (subject) => subject.subjectName === selectedSubject,
            ) ?? null;

        if (!selectedSubjectData) {
            return;
        }

        const subjectData = selectedSubjectData;

        let isMounted = true;

        async function loadJournal() {
            setLoadingJournal(true);
            const result = await loadJournalDataFromApi(
                groupData.groupId,
                subjectData.subjectId,
                JOURNAL_DAYS.map((day) => day.fullDate),
            );

            if (!isMounted) {
                return;
            }

            if (result.error?.code === "UNAUTHORIZED") {
                router.replace("/");
                return;
            }

            if (result.error) {
                setError(result.error);
                setLoadingJournal(false);
                return;
            }

            const journal = result.data;
            const nextGrades: GradesState = {};
            const nextAttendance: AttendanceState = {};
            const nextLessonIdsByDay: Record<number, number> = {};

            for (const student of journal.students) {
                const studentKey = String(student.id);
                nextGrades[studentKey] = {};
                nextAttendance[studentKey] = {};

                for (const grade of student.grades) {
                    const dayIndex = JOURNAL_DAYS.findIndex(
                        (day) => day.label === toJournalLabel(grade.date),
                    );

                    if (dayIndex >= 0) {
                        nextGrades[studentKey]![dayIndex] =
                            grade.grade as 2 | 3 | 4 | 5;
                    }
                }

                for (const item of student.attendances) {
                    const dayIndex = JOURNAL_DAYS.findIndex(
                        (day) => day.label === toJournalLabel(item.date),
                    );

                    if (dayIndex >= 0) {
                        nextAttendance[studentKey]![dayIndex] =
                            mapAttendanceTypeNameToStatus(item.attendanceTypeName);
                    }
                }
            }

            for (const lesson of journal.lessons) {
                const dayIndex = JOURNAL_DAYS.findIndex(
                    (day) => day.label === toJournalLabel(lesson.date),
                );

                if (dayIndex >= 0) {
                    nextLessonIdsByDay[dayIndex] = lesson.lessonId;
                }
            }

            setStudents(
                journal.students.map((student) => ({
                    id: String(student.id),
                    name: student.fullName,
                })),
            );
            setGrades(nextGrades);
            setAttendance(nextAttendance);
            setLessonIdsByDay(nextLessonIdsByDay);
            setError(null);
            setLoadingJournal(false);
        }

        void loadJournal();

        return () => {
            isMounted = false;
        };
    }, [router, selectedGroupData, selectedSubject]);

    const updateFilters = useCallback(
        (group: string, subject: string) => {
            setSelectedGroup(group);
            setSelectedSubject(subject);
        },
        [],
    );

    const handleGradeClick = useCallback(
        async (studentId: string, dayIdx: number) => {
            if (!selectedGroupData) {
                return;
            }

            const day = JOURNAL_DAYS[dayIdx];
            if (!day) {
                return;
            }

            const subject =
                selectedGroupData.subjects.find(
                    (item) => item.subjectName === selectedSubject,
                ) ?? null;

            if (!subject) {
                return;
            }

            const previousValue = grades[studentId]?.[dayIdx] ?? null;
            const nextValue = nextGrade(previousValue);

            setGrades((prev) => ({
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    [dayIdx]: nextValue,
                },
            }));

            const saveResult = await saveGradeToApi({
                studentId: Number(studentId),
                subjectId: subject.subjectId,
                grade: nextValue,
                date: toApiDate(day.fullDate),
            });

            if (saveResult.error?.code === "UNAUTHORIZED") {
                router.replace("/");
                return;
            }

            if (saveResult.error) {
                setGrades((prev) => ({
                    ...prev,
                    [studentId]: {
                        ...prev[studentId],
                        [dayIdx]: previousValue,
                    },
                }));
                setError(saveResult.error);
            }
        },
        [grades, router, selectedGroupData, selectedSubject],
    );

    const handleAttendanceClick = useCallback(
        async (studentId: string, dayIdx: number) => {
            const lessonId = lessonIdsByDay[dayIdx];
            if (!lessonId || !filtersData) {
                setError({
                    code: "VALIDATION_ERROR",
                    message:
                        "Для выбранной даты нет урока по этой группе и предмету.",
                });
                return;
            }

            const previousValue = attendance[studentId]?.[dayIdx] ?? null;
            const nextValue = nextStatus(previousValue);

            setAttendance((prev) => ({
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    [dayIdx]: nextValue,
                },
            }));

            const saveResult = await saveAttendanceToApi({
                lessonId,
                studentId: Number(studentId),
                typeId: getAttendanceTypeIdByStatus(
                    filtersData.attendanceTypes,
                    nextValue,
                ),
            });

            if (saveResult.error?.code === "UNAUTHORIZED") {
                router.replace("/");
                return;
            }

            if (saveResult.error) {
                setAttendance((prev) => ({
                    ...prev,
                    [studentId]: {
                        ...prev[studentId],
                        [dayIdx]: previousValue,
                    },
                }));
                setError(saveResult.error);
            }
        },
        [attendance, filtersData, lessonIdsByDay, router],
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
                        <span className="text-text/40 shrink-0">В·</span>
                        <span
                            className="text-accent/85 truncate"
                            title={`${selectedSubject} В· ${selectedGroup}`}
                        >
                            {selectedSubject} В· {selectedGroup}
                        </span>
                    </div>
                </div>
                <div className="shrink-0">
                    <ModeToggle mode={mode} onChange={setMode} />
                </div>
            </div>

            {loadingFilters ? (
                <PageState
                    title="Загрузка фильтров журнала"
                    description="Получаем группы, предметы и типы посещаемости из API."
                />
            ) : error && !filtersData ? (
                <PageState
                    title="Ошибка загрузки журнала"
                    description={error.message}
                    variant="error"
                />
            ) : (
                <>
                    <JournalFilters
                        selectedGroup={selectedGroup}
                        selectedSubject={selectedSubject}
                        groups={(filtersData?.groups ?? []).map((group) => ({
                            value: group.groupName,
                            label: group.groupName,
                        }))}
                        subjects={availableSubjects.map((subject) => ({
                            value: subject.subjectName,
                            label: subject.subjectName,
                        }))}
                        onChange={updateFilters}
                    />

                    <GlassCard
                        className="flex-1 overflow-hidden flex flex-col min-h-0 mb-24"
                        intensity="medium"
                    >
                        {error ? (
                            <div className="p-4">
                                <PageState
                                    title="Ошибка загрузки журнала"
                                    description={error.message}
                                    variant="error"
                                />
                            </div>
                        ) : loadingJournal ? (
                            <div className="p-4">
                                <PageState
                                    title="Загрузка журнала"
                                    description="Получаем студентов, оценки и посещаемость из API."
                                />
                            </div>
                        ) : students.length === 0 ? (
                            <div className="p-4">
                                <PageState
                                    title="Журнал пока пуст"
                                    description="Для выбранной группы пока не найдено студентов."
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
                                        setPage((p) =>
                                            Math.min(totalPages - 1, p + 1),
                                        )
                                    }
                                />
                            </>
                        )}
                    </GlassCard>
                </>
            )}
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
