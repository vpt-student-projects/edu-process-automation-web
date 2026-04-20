import {
    getDefaultJournalFilters,
    isKnownGroup,
    isKnownSubject,
} from "@/lib/services/educationData";

export interface JournalFilters {
    group: string;
    subject: string;
}

const DEFAULT_FILTERS: JournalFilters = getDefaultJournalFilters();

function normalizeGroup(group?: string | null): string {
    if (!group) return DEFAULT_FILTERS.group;
    return isKnownGroup(group) ? group : DEFAULT_FILTERS.group;
}

function normalizeSubject(subject?: string | null): string {
    if (!subject) return DEFAULT_FILTERS.subject;
    return isKnownSubject(subject) ? subject : DEFAULT_FILTERS.subject;
}

export function normalizeJournalFilters(
    group?: string | null,
    subject?: string | null,
): JournalFilters {
    return {
        group: normalizeGroup(group),
        subject: normalizeSubject(subject),
    };
}

export function buildJournalHref(filters: JournalFilters): string {
    const params = new URLSearchParams({
        group: filters.group,
        subject: filters.subject,
    });
    return `/journal?${params.toString()}`;
}
