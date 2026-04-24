const API_URL_STORAGE_KEY = "volptedu.apiBaseUrl";
const DEFAULT_API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

function normalizeApiBaseUrl(value: string): string {
    return value.trim().replace(/\/+$/, "");
}

export function getDefaultApiBaseUrl(): string {
    return normalizeApiBaseUrl(DEFAULT_API_BASE_URL);
}

export function getStoredApiBaseUrl(): string {
    if (typeof window === "undefined") {
        return getDefaultApiBaseUrl();
    }

    const storedValue = window.localStorage.getItem(API_URL_STORAGE_KEY);
    return storedValue
        ? normalizeApiBaseUrl(storedValue)
        : getDefaultApiBaseUrl();
}

export function saveApiBaseUrl(value: string): string {
    const normalizedValue = normalizeApiBaseUrl(value);

    if (typeof window !== "undefined") {
        window.localStorage.setItem(API_URL_STORAGE_KEY, normalizedValue);
    }

    return normalizedValue;
}
