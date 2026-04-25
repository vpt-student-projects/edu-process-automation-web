import {
    ALL_SUBJECTS,
    MOCK_GROUPS,
    MOCK_SCHEDULE_TEMPLATE,
    MOCK_STUDENTS,
} from "@/constants";
import { clearAuthSession, getAccessToken } from "@/lib/auth/session";
import { getStoredApiBaseUrl } from "@/lib/config/api";
import type {
    GroupDto,
    ScheduleDayDto,
    StudentDto,
    LessonDto,
} from "@/types/dto";
import type { AttendanceStatus, Grade } from "@/types/journal";
import type { DayTemplate, GroupSummary, Student } from "@/types/types";

export interface ServiceError {
    code: "DATA_SOURCE_ERROR" | "VALIDATION_ERROR" | "UNAUTHORIZED";
    message: string;
}

export type ServiceResult<T> =
    | {
          data: T;
          error: null;
      }
    | {
          data: null;
          error: ServiceError;
      };

interface ApiLessonDto {
    id: number;
    date: string;
    number: number;
    subjectName: string;
    groupName: string;
    classroom: string | null;
    comment: string | null;
}

interface ApiGroupDto {
    id: number;
    name: string;
}

export interface JournalSubjectFilter {
    subjectId: number;
    subjectName: string;
}

export interface JournalGroupFilter {
    groupId: number;
    groupName: string;
    subjects: JournalSubjectFilter[];
}

export interface JournalAttendanceType {
    id: number;
    name: string;
}

export interface JournalFiltersData {
    groups: JournalGroupFilter[];
    attendanceTypes: JournalAttendanceType[];
}

interface ApiJournalFiltersResponse {
    groups: JournalGroupFilter[];
    attendanceTypes: JournalAttendanceType[];
}

interface ApiJournalLesson {
    lessonId: number;
    date: string;
    number: number;
}

interface ApiJournalGrade {
    date: string;
    grade: number;
}

interface ApiJournalAttendance {
    lessonId: number;
    date: string;
    attendanceTypeId: number | null;
    attendanceTypeName: string | null;
}

interface ApiJournalStudent {
    id: number;
    fullName: string;
    grades: ApiJournalGrade[];
    attendances: ApiJournalAttendance[];
}

interface ApiJournalDataResponse {
    groupId: number;
    subjectId: number;
    lessons: ApiJournalLesson[];
    students: ApiJournalStudent[];
}

export interface JournalData {
    groupId: number;
    subjectId: number;
    lessons: ApiJournalLesson[];
    students: ApiJournalStudent[];
}

export interface SaveGradeRequest {
    studentId: number;
    subjectId: number;
    grade: Grade;
    date: string;
}

export interface SaveAttendanceRequest {
    lessonId: number;
    studentId: number;
    typeId: number | null;
}

export function getGroups(): ReadonlyArray<GroupSummary> {
    return (MOCK_GROUPS as GroupDto[]).map(mapGroupDto);
}

export function getSubjects(): ReadonlyArray<string> {
    return ALL_SUBJECTS;
}

export function getStudents(): ReadonlyArray<Student> {
    return (MOCK_STUDENTS as StudentDto[]).map(mapStudentDto);
}

export function getScheduleTemplate(): ReadonlyArray<DayTemplate> {
    return (MOCK_SCHEDULE_TEMPLATE as ScheduleDayDto[]).map(mapScheduleDayDto);
}

export function isKnownGroup(group: string): boolean {
    return getGroups().some((item) => item.name === group);
}

export function isKnownSubject(subject: string): boolean {
    return getSubjects().includes(subject);
}

export function getDefaultJournalFilters() {
    return {
        group: getGroups()[0]?.name ?? "",
        subject: getSubjects()[0] ?? "",
    };
}

function mapError(message: string): ServiceError {
    return { code: "DATA_SOURCE_ERROR", message };
}

function mapValidationError(message: string): ServiceError {
    return { code: "VALIDATION_ERROR", message };
}

function mapUnauthorizedError(): ServiceError {
    return {
        code: "UNAUTHORIZED",
        message: "Сессия истекла или токен отсутствует. Войдите снова.",
    };
}

function isLessonDto(value: unknown): value is LessonDto {
    if (typeof value !== "object" || value === null) return false;
    const lesson = value as LessonDto;
    return (
        typeof lesson.id === "string" &&
        typeof lesson.subject === "string" &&
        typeof lesson.group === "string" &&
        typeof lesson.room === "string" &&
        typeof lesson.pairNumber === "number"
    );
}

function isScheduleDayDto(value: unknown): value is ScheduleDayDto {
    if (typeof value !== "object" || value === null) return false;
    const day = value as ScheduleDayDto;
    return (
        typeof day.dayName === "string" &&
        Array.isArray(day.lessons) &&
        day.lessons.every(isLessonDto)
    );
}

function isGroupDto(value: unknown): value is GroupDto {
    if (typeof value !== "object" || value === null) return false;
    const group = value as GroupDto;
    return (
        typeof group.id === "string" &&
        typeof group.name === "string" &&
        Array.isArray(group.subjects) &&
        group.subjects.every((subject) => typeof subject === "string")
    );
}

function isStudentDto(value: unknown): value is StudentDto {
    if (typeof value !== "object" || value === null) return false;
    const student = value as StudentDto;
    return (
        typeof student.id === "string" &&
        typeof student.name === "string" &&
        Array.isArray(student.grades) &&
        Array.isArray(student.attendance)
    );
}

function mapStudentDto(dto: StudentDto): Student {
    return {
        id: dto.id,
        name: dto.name,
        grades: [...dto.grades],
        attendance: [...dto.attendance],
    };
}

function mapGroupDto(dto: GroupDto): GroupSummary {
    return {
        id: dto.id,
        name: dto.name,
        subjects: [...dto.subjects],
    };
}

function mapScheduleDayDto(dto: ScheduleDayDto): DayTemplate {
    return {
        dayName: dto.dayName,
        lessons: dto.lessons.map((lesson) => ({ ...lesson })),
    };
}

function mapApiLessonDto(dto: ApiLessonDto): LessonDto {
    return {
        id: String(dto.id),
        subject: dto.subjectName,
        group: dto.groupName,
        room: dto.classroom?.trim() || "TBA",
        pairNumber: dto.number,
    };
}

function formatApiDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function formatDayName(date: Date): string {
    const dayName = date.toLocaleDateString("ru-RU", { weekday: "long" });
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
}

function getAuthHeaders(): HeadersInit | null {
    const token = getAccessToken();
    if (!token) {
        return null;
    }

    return {
        Authorization: `Bearer ${token}`,
    };
}

async function apiGet<T>(path: string): Promise<ServiceResult<T>> {
    const headers = getAuthHeaders();
    if (!headers) {
        return { data: null, error: mapUnauthorizedError() };
    }

    try {
        const response = await fetch(`${getStoredApiBaseUrl()}${path}`, {
            headers,
        });

        if (response.status === 401) {
            clearAuthSession();
            return { data: null, error: mapUnauthorizedError() };
        }

        if (!response.ok) {
            return {
                data: null,
                error: mapError("Сервер вернул ошибку при загрузке данных."),
            };
        }

        const data = (await response.json()) as T;
        return { data, error: null };
    } catch {
        return {
            data: null,
            error: mapError("Не удалось подключиться к API-серверу."),
        };
    }
}

async function apiPost(path: string, body: unknown): Promise<ServiceResult<null>> {
    const headers = getAuthHeaders();
    if (!headers) {
        return { data: null, error: mapUnauthorizedError() };
    }

    try {
        const response = await fetch(`${getStoredApiBaseUrl()}${path}`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (response.status === 401) {
            clearAuthSession();
            return { data: null, error: mapUnauthorizedError() };
        }

        if (!response.ok) {
            return {
                data: null,
                error: mapError("Не удалось сохранить изменения в журнале."),
            };
        }

        return { data: null, error: null };
    } catch {
        return {
            data: null,
            error: mapError("Не удалось подключиться к API-серверу."),
        };
    }
}

export function loadGroups(): ServiceResult<ReadonlyArray<GroupSummary>> {
    try {
        if (!(MOCK_GROUPS as unknown[]).every(isGroupDto)) {
            return {
                data: null,
                error: mapValidationError("Получены некорректные данные групп."),
            };
        }
        return { data: getGroups(), error: null };
    } catch {
        return {
            data: null,
            error: mapError("Не удалось загрузить список групп."),
        };
    }
}

export async function loadGroupsFromApi(): Promise<
    ServiceResult<ReadonlyArray<GroupSummary>>
> {
    const result = await apiGet<ApiGroupDto[]>("/api/Teacher/groups/my");
    if (result.error) {
        return result;
    }

    return {
        data: result.data.map((group) => ({
            id: String(group.id),
            name: group.name,
            subjects: [],
        })),
        error: null,
    };
}

export async function loadJournalFiltersFromApi(): Promise<
    ServiceResult<JournalFiltersData>
> {
    return apiGet<ApiJournalFiltersResponse>("/api/Teacher/journal/filters");
}

export async function loadJournalDataFromApi(
    groupId: number,
    subjectId: number,
    dates: readonly Date[],
): Promise<ServiceResult<JournalData>> {
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];

    if (!firstDate || !lastDate) {
        return {
            data: {
                groupId,
                subjectId,
                lessons: [],
                students: [],
            },
            error: null,
        };
    }

    const from = formatApiDate(firstDate);
    const to = formatApiDate(lastDate);

    return apiGet<ApiJournalDataResponse>(
        `/api/Teacher/journal?groupId=${groupId}&subjectId=${subjectId}&from=${from}&to=${to}`,
    );
}

export async function saveGradeToApi(
    request: SaveGradeRequest,
): Promise<ServiceResult<null>> {
    return apiPost("/api/Teacher/grades", {
        studentId: request.studentId,
        subjectId: request.subjectId,
        grade: request.grade,
        date: request.date,
    });
}

export async function saveAttendanceToApi(
    request: SaveAttendanceRequest,
): Promise<ServiceResult<null>> {
    return apiPost("/api/Teacher/attendance", {
        lessonId: request.lessonId,
        studentId: request.studentId,
        typeId: request.typeId,
    });
}

export function loadStudents(): ServiceResult<ReadonlyArray<Student>> {
    try {
        if (!(MOCK_STUDENTS as unknown[]).every(isStudentDto)) {
            return {
                data: null,
                error: mapValidationError(
                    "Получены некорректные данные студентов.",
                ),
            };
        }
        return { data: getStudents(), error: null };
    } catch {
        return {
            data: null,
            error: mapError("Не удалось загрузить список студентов."),
        };
    }
}

export function loadScheduleTemplate(): ServiceResult<
    ReadonlyArray<DayTemplate>
> {
    try {
        if (!(MOCK_SCHEDULE_TEMPLATE as unknown[]).every(isScheduleDayDto)) {
            return {
                data: null,
                error: mapValidationError(
                    "Получены некорректные данные расписания.",
                ),
            };
        }
        return { data: getScheduleTemplate(), error: null };
    } catch {
        return {
            data: null,
            error: mapError("Не удалось загрузить расписание."),
        };
    }
}

export async function loadScheduleTemplateFromApi(
    dates: readonly Date[],
): Promise<ServiceResult<ReadonlyArray<DayTemplate>>> {
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];

    if (!firstDate || !lastDate) {
        return { data: [], error: null };
    }

    const from = formatApiDate(firstDate);
    const to = formatApiDate(lastDate);
    const result = await apiGet<ApiLessonDto[]>(
        `/api/Teacher/lessons/my?from=${from}&to=${to}`,
    );

    if (result.error) {
        return result;
    }

    const lessonsByDate = new Map<string, LessonDto[]>();
    for (const date of dates) {
        lessonsByDate.set(formatApiDate(date), []);
    }

    for (const lesson of result.data) {
        const current = lessonsByDate.get(lesson.date);
        if (!current) {
            continue;
        }

        current.push(mapApiLessonDto(lesson));
    }

    const schedule = dates.map((date) => {
        const dateKey = formatApiDate(date);
        const lessons = (lessonsByDate.get(dateKey) ?? []).sort(
            (a, b) => a.pairNumber - b.pairNumber,
        );

        return {
            dayName: formatDayName(date),
            lessons,
        };
    });

    return { data: schedule, error: null };
}

export function mapAttendanceTypeNameToStatus(
    value: string | null | undefined,
): AttendanceStatus {
    const normalized = value?.trim().toLowerCase();

    switch (normalized) {
        case "нб":
            return "НБ";
        case "оп":
            return "ОП";
        case "ув":
            return "УВ";
        case "уш":
            return "УШ";
        case "от":
            return "ОТ";
        default:
            return null;
    }
}
