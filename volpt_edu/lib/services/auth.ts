import { saveApiBaseUrl } from "@/lib/config/api";
import type { AuthSessionPayload } from "@/lib/auth/session";

export interface LoginRequest {
    apiBaseUrl: string;
    login: string;
    password: string;
}

interface LoginApiResponse {
    accessToken: string;
    refreshToken: string;
    fullName: string;
    role: string;
    userId: number;
}

export async function loginUser({
    apiBaseUrl,
    login,
    password,
}: LoginRequest): Promise<AuthSessionPayload> {
    const normalizedBaseUrl = saveApiBaseUrl(apiBaseUrl);
    const response = await fetch(`${normalizedBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Неверный логин или пароль.");
        }

        throw new Error("Не удалось подключиться к API. Проверьте адрес сервера.");
    }

    const data = (await response.json()) as LoginApiResponse;

    return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        fullName: data.fullName,
        role: data.role,
        userId: data.userId,
    };
}
