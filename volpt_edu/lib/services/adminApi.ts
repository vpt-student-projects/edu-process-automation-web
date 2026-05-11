import { clearAuthSession, getAccessToken } from "@/lib/auth/session";
import { getStoredApiBaseUrl } from "@/lib/config/api";

export interface AdminStudentRow {
    id: number;
    fullName: string;
    groupName: string;
}

export interface AdminTeacherRow {
    id: number;
    login: string;
    fullName: string;
}

export interface AdminSubjectRow {
    id: number;
    name: string;
    /** API может вернуть camelCase или с подчёркиванием */
    total_hours?: number | null;
    totalHours?: number | null;
}

export interface ImportStudentsResult {
    added: string[];
    errors: string[];
    addedCount: number;
    errorsCount: number;
}

async function adminFetch<T>(
    path: string,
    options?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; error: string; unauthorized?: boolean }> {
    const token = getAccessToken();
    if (!token) {
        return { ok: false, error: "Нет сессии" };
    }

    const url = `${getStoredApiBaseUrl()}${path}`;
    const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
        ...(options?.headers ?? {}),
    };

    if (options?.body && !(headers as Record<string, string>)["Content-Type"]) {
        (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    let response: Response;
    try {
        response = await fetch(url, { ...options, headers });
    } catch {
        return { ok: false, error: "Не удалось связаться с сервером." };
    }

    if (response.status === 401) {
        clearAuthSession();
        return { ok: false, error: "Сессия истекла.", unauthorized: true };
    }

    if (response.status === 204) {
        return { ok: true, data: undefined as T };
    }

    const text = await response.text();
    if (!response.ok) {
        try {
            const j = JSON.parse(text) as { message?: string };
            return {
                ok: false,
                error: j.message ?? `Ошибка ${response.status}`,
            };
        } catch {
            return {
                ok: false,
                error: text || `Ошибка ${response.status}`,
            };
        }
    }

    if (!text) {
        return { ok: true, data: {} as T };
    }

    try {
        return { ok: true, data: JSON.parse(text) as T };
    } catch {
        return { ok: false, error: "Некорректный ответ сервера." };
    }
}

export async function adminGetStudents(): Promise<
    | { ok: true; data: AdminStudentRow[] }
    | { ok: false; error: string; unauthorized?: boolean }
> {
    return adminFetch<AdminStudentRow[]>("/api/Admin/students");
}

export async function adminImportStudents(studentList: string): Promise<
    | { ok: true; data: ImportStudentsResult }
    | { ok: false; error: string; unauthorized?: boolean }
> {
    return adminFetch<ImportStudentsResult>("/api/Admin/students/import", {
        method: "POST",
        body: JSON.stringify({ studentList }),
    });
}

export async function adminAddStudent(
    fullName: string,
    groupName: string,
): Promise<
    | { ok: true; data: { id: number; fullName: string; groupName: string } }
    | { ok: false; error: string; unauthorized?: boolean }
> {
    return adminFetch("/api/Admin/students", {
        method: "POST",
        body: JSON.stringify({ fullName, groupName }),
    });
}

export async function adminDeleteStudent(
    id: number,
): Promise<{ ok: true } | { ok: false; error: string; unauthorized?: boolean }> {
    const r = await adminFetch<{ message?: string }>(
        `/api/Admin/students/${id}`,
        { method: "DELETE" },
    );
    if (!r.ok) {
        return r;
    }
    return { ok: true };
}

export async function adminGetTeachers(): Promise<
    | { ok: true; data: AdminTeacherRow[] }
    | { ok: false; error: string; unauthorized?: boolean }
> {
    return adminFetch<AdminTeacherRow[]>("/api/Admin/teachers");
}

export async function adminAddTeacher(payload: {
    login: string;
    fullName: string;
    password?: string;
}): Promise<
    | { ok: true; data: { id: number; login: string; fullName: string } }
    | { ok: false; error: string; unauthorized?: boolean }
> {
    return adminFetch("/api/Admin/teachers", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function adminDeleteTeacher(
    id: number,
): Promise<{ ok: true } | { ok: false; error: string; unauthorized?: boolean }> {
    const r = await adminFetch<{ message?: string }>(
        `/api/Admin/teachers/${id}`,
        { method: "DELETE" },
    );
    if (!r.ok) {
        return r;
    }
    return { ok: true };
}

export async function adminGetSubjects(): Promise<
    | { ok: true; data: AdminSubjectRow[] }
    | { ok: false; error: string; unauthorized?: boolean }
> {
    return adminFetch<AdminSubjectRow[]>("/api/Admin/subjects");
}

export async function adminAddSubject(payload: {
    name: string;
    totalHours?: number | null;
}): Promise<
    | { ok: true; data: { id: number; name: string; total_hours?: number } }
    | { ok: false; error: string; unauthorized?: boolean }
> {
    return adminFetch("/api/Admin/subjects", {
        method: "POST",
        body: JSON.stringify({
            name: payload.name,
            totalHours: payload.totalHours ?? null,
        }),
    });
}

export async function adminUpdateSubject(
    id: number,
    payload: { name: string; totalHours?: number | null },
): Promise<
    | { ok: true; data: { id: number; name: string; total_hours?: number } }
    | { ok: false; error: string; unauthorized?: boolean }
> {
    return adminFetch(`/api/Admin/subjects/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            name: payload.name,
            totalHours: payload.totalHours ?? null,
        }),
    });
}

export async function adminDeleteSubject(
    id: number,
): Promise<{ ok: true } | { ok: false; error: string; unauthorized?: boolean }> {
    const r = await adminFetch<{ message?: string }>(
        `/api/Admin/subjects/${id}`,
        { method: "DELETE" },
    );
    if (!r.ok) {
        return r;
    }
    return { ok: true };
}

export async function adminChangeLogin(
    userId: number,
    newLogin: string,
): Promise<{ ok: true } | { ok: false; error: string; unauthorized?: boolean }> {
    const r = await adminFetch<{ message?: string }>(
        `/api/Admin/users/${userId}/login`,
        {
            method: "PUT",
            body: JSON.stringify({ newLogin }),
        },
    );
    if (!r.ok) {
        return r;
    }
    return { ok: true };
}

export async function adminChangePassword(
    userId: number,
    newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string; unauthorized?: boolean }> {
    const r = await adminFetch<{ message?: string }>(
        `/api/Admin/users/${userId}/password`,
        {
            method: "PUT",
            body: JSON.stringify({ newPassword }),
        },
    );
    if (!r.ok) {
        return r;
    }
    return { ok: true };
}
