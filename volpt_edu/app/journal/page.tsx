"use client";

import { useState, useCallback, Suspense, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import { JournalMode } from "@/types/types";
import {
    JOURNAL_DAYS,
    TODAY_INDEX,
    apiDateToIsoKey,
} from "@/hooks/useJournalDays";
import {
    GradesState,
    AttendanceState,
    type Grade,
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
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { getStoredUser, isAdminRole } from "@/lib/auth/session";

const ITEMS_PER_PAGE = 18;

function toApiDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
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

    useEffect(() => {
        const user = getStoredUser();
        if (isAdminRole(user?.role)) {
            router.replace("/admin");
        }
    }, [router]);
    const [initialQuery] = useState(() => ({
        group: searchParams.get("group"),
        subject: searchParams.get("subject"),
    }));

    const [mode, setMode] = useState<JournalMode>("ATTENDANCE");
    const [page, setPage] = useState(0);
    const [filtersData, setFiltersData] = useState<JournalFiltersData | null>(
        null,
    );
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [grades, setGrades] = useState<GradesState>({});
    const [attendance, setAttendance] = useState<AttendanceState>({});
    const [students, setStudents] = useState<
        ReadonlyArray<{ id: string; name: string }>
    >([]);
    /** Индексы дней в JOURNAL_DAYS, в которые по API есть занятия (пары) */
    const [lessonDayIndices, setLessonDayIndices] = useState<number[]>([]);
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [loadingJournal, setLoadingJournal] = useState(true);
    const [error, setError] = useState<ServiceError | null>(null);

    const totalPages = useMemo(
        () =>
            lessonDayIndices.length === 0
                ? 1
                : Math.ceil(lessonDayIndices.length / ITEMS_PER_PAGE),
        [lessonDayIndices.length],
    );

    const { currentDays, columnDayIndices } = useMemo(() => {
        const start = page * ITEMS_PER_PAGE;
        const indices = lessonDayIndices.slice(start, start + ITEMS_PER_PAGE);
        return {
            columnDayIndices: indices,
            currentDays: indices.map((i) => JOURNAL_DAYS[i]!),
        };
    }, [lessonDayIndices, page]);

    const selectedGroupData = useMemo(
        () =>
            filtersData?.groups.find(
                (group) => group.groupName === selectedGroup,
            ) ?? null,
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
            const requestedGroup = initialQuery.group;
            const initialGroup =
                data.groups.find(
                    (group) => group.groupName === requestedGroup,
                ) ??
                data.groups[0] ??
                null;
            const requestedSubject = initialQuery.subject;
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
    }, [router]);

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
                setLessonDayIndices([]);
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
                        (day) => day.isoKey === apiDateToIsoKey(grade.date),
                    );

                    if (dayIndex >= 0) {
                        nextGrades[studentKey]![dayIndex] = grade.grade as
                            | 2
                            | 3
                            | 4
                            | 5;
                    }
                }

                for (const item of student.attendances) {
                    const dayIndex = JOURNAL_DAYS.findIndex(
                        (day) => day.isoKey === apiDateToIsoKey(item.date),
                    );

                    if (dayIndex >= 0) {
                        nextAttendance[studentKey]![dayIndex] =
                            mapAttendanceTypeNameToStatus(
                                item.attendanceTypeName,
                            );
                    }
                }
            }

            for (const lesson of journal.lessons) {
                const dayIndex = JOURNAL_DAYS.findIndex(
                    (day) => day.isoKey === apiDateToIsoKey(lesson.date),
                );

                if (dayIndex >= 0) {
                    nextLessonIdsByDay[dayIndex] = lesson.lessonId;
                }
            }

            const nextLessonDayIndices = Object.keys(nextLessonIdsByDay)
                .map(Number)
                .sort((a, b) => a - b);
            setLessonDayIndices(nextLessonDayIndices);
            const todayPos = nextLessonDayIndices.indexOf(TODAY_INDEX);
            setPage(todayPos >= 0 ? Math.floor(todayPos / ITEMS_PER_PAGE) : 0);

            setStudents(
                journal.students.map((student) => ({
                    id: String(student.id),
                    name: student.fullName,
                })),
            );
            setGrades(nextGrades);
            setAttendance(nextAttendance);
            setError(null);
            setLoadingJournal(false);
        }

        void loadJournal();

        return () => {
            isMounted = false;
        };
    }, [router, selectedGroupData, selectedSubject]);

    const updateFilters = useCallback((group: string, subject: string) => {
        setSelectedGroup(group);
        setSelectedSubject(subject);
    }, []);

    const handleGradeSelect = useCallback(
        async (studentId: string, dayIdx: number, nextValue: Grade) => {
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
            } else {
                setError(null);
            }
        },
        [grades, router, selectedGroupData, selectedSubject],
    );

    const handleAttendanceSelect = useCallback(
        async (
            studentId: string,
            dayIdx: number,
            nextValue: AttendanceStatus,
        ) => {
            if (!selectedGroupData || !filtersData) {
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

            const previousValue = attendance[studentId]?.[dayIdx] ?? null;

            setAttendance((prev) => ({
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    [dayIdx]: nextValue,
                },
            }));

            const saveResult = await saveAttendanceToApi({
                subjectId: subject.subjectId,
                studentId: Number(studentId),
                date: day.isoKey,
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
            } else {
                setError(null);
            }
        },
        [attendance, filtersData, router, selectedGroupData, selectedSubject],
    );

    return (
        <div className="flex flex-col p-4 md:p-6 mx-auto w-full gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="pl-2 min-w-0 overflow-hidden flex items-center gap-3">
                    <svg
                        className="w-[120px] md:w-[100px] sm:w-[80px] h-auto flex-shrink-0"
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
                    <div className="min-w-0 overflow-hidden">
                        <h2 className="text-text text-h2 drop-shadow-sm">
                            Журнал
                        </h2>
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
                </div>
                <div className="shrink-0">
                    <ModeToggle mode={mode} onChange={setMode} />
                </div>
            </div>

            {loadingFilters ? (
                <PageSkeleton variant="journal" />
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
                        ) : lessonDayIndices.length === 0 ? (
                            <div className="p-4">
                                <PageState
                                    title="Нет занятий в периоде"
                                    description="В выбранном диапазоне дат нет пар по этой группе и предмету — колонки с датами не отображаются."
                                />
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-auto min-h-0 custom-scrollbar">
                                    <JournalTable
                                        mode={mode}
                                        students={students}
                                        currentDays={currentDays}
                                        columnDayIndices={columnDayIndices}
                                        grades={grades}
                                        attendance={attendance}
                                        onGradeSelect={handleGradeSelect}
                                        onAttendanceSelect={
                                            handleAttendanceSelect
                                        }
                                    />
                                </div>
                                <JournalPagination
                                    page={page}
                                    totalPages={totalPages}
                                    currentDays={currentDays}
                                    onPrev={() =>
                                        setPage((p) => Math.max(0, p - 1))
                                    }
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
