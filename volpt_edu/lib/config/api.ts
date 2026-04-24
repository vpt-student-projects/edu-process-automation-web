const DEFAULT_API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

function normalizeApiBaseUrl(value: string): string {
    return value.trim().replace(/\/+$/, "");
}

export function getDefaultApiBaseUrl(): string {
    return normalizeApiBaseUrl(DEFAULT_API_BASE_URL);
}

export function getStoredApiBaseUrl(): string {
    return getDefaultApiBaseUrl();
}

export function saveApiBaseUrl(value: string): string {
    return normalizeApiBaseUrl(value);
}
