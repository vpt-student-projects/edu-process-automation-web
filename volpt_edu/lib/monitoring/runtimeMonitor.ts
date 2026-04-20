"use client";

export interface RuntimeErrorPayload {
    message: string;
    stack?: string;
    context?: Record<string, string>;
}

export async function reportRuntimeError(payload: RuntimeErrorPayload) {
    if (typeof window === "undefined") return;

    try {
        await fetch("/api/monitoring/client-error", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...payload,
                userAgent: navigator.userAgent,
                path: window.location.pathname,
                timestamp: new Date().toISOString(),
            }),
        });
    } catch {
        // no-op fallback: monitoring endpoint failure should not break UI
    }
}
