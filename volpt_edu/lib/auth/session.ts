const ACCESS_TOKEN_STORAGE_KEY = "volptedu.accessToken";
const REFRESH_TOKEN_STORAGE_KEY = "volptedu.refreshToken";
const USER_STORAGE_KEY = "volptedu.user";

export interface StoredUser {
    userId: number;
    fullName: string;
    role: string;
}

export interface AuthSessionPayload {
    accessToken: string;
    refreshToken: string;
    fullName: string;
    role: string;
    userId: number;
}

export function saveAuthSession(payload: AuthSessionPayload) {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, payload.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, payload.refreshToken);
    window.localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify({
            userId: payload.userId,
            fullName: payload.fullName,
            role: payload.role,
        } satisfies StoredUser),
    );
}

export function clearAuthSession() {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
}

export function getAccessToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getRefreshToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function hasAuthSession(): boolean {
    return Boolean(getAccessToken() && getRefreshToken());
}
