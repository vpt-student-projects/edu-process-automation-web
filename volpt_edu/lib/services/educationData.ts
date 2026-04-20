import {
    ALL_SUBJECTS,
    MOCK_GROUPS,
    MOCK_SCHEDULE_TEMPLATE,
    MOCK_STUDENTS,
} from "@/constants";
import type {
    GroupDto,
    ScheduleDayDto,
    StudentDto,
    LessonDto,
} from "@/types/dto";
import type { DayTemplate, GroupSummary, Student } from "@/types/types";

export interface ServiceError {
    code: "DATA_SOURCE_ERROR" | "VALIDATION_ERROR";
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
