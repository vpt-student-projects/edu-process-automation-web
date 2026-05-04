// hooks/useJournalDays.ts
export type JournalDay = {
    /** YYYY-MM-DD в локальной зоне, уникален для индекса и сопоставления с API */
    isoKey: string;
    /** Подпись в шапке (дд.мм.гг) */
    label: string;
    fullDate: Date;
};

function pad2(n: number): string {
    return String(n).padStart(2, "0");
}

/** Дата из API (DateOnly / ISO) → YYYY-MM-DD */
export function apiDateToIsoKey(date: string): string {
    return date.trim().slice(0, 10);
}

/** Широкий диапазон: прошлые пары из БД попадают в запрос и в колонки журнала */
const YEARS_BACK = 20;
const YEARS_FORWARD = 2;

function generateJournalDays(): JournalDay[] {
    const days: JournalDay[] = [];
    const start = new Date();
    start.setFullYear(start.getFullYear() - YEARS_BACK);
    start.setMonth(0, 1);

    const end = new Date();
    end.setFullYear(end.getFullYear() + YEARS_FORWARD);
    end.setMonth(11, 31);

    const cur = new Date(start);
    while (cur <= end) {
        if (cur.getDay() !== 0) {
            const y = cur.getFullYear();
            const m = cur.getMonth() + 1;
            const d = cur.getDate();
            const isoKey = `${y}-${pad2(m)}-${pad2(d)}`;
            const label = `${pad2(d)}.${pad2(m)}.${String(y).slice(-2)}`;
            days.push({
                isoKey,
                label,
                fullDate: new Date(cur),
            });
        }
        cur.setDate(cur.getDate() + 1);
    }
    return days;
}

export const JOURNAL_DAYS = generateJournalDays();

const now = new Date();
export const todayIsoKey = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

/** @deprecated используйте todayIsoKey и сравнение по isoKey */
export const todayStr = `${pad2(now.getDate())}.${pad2(now.getMonth() + 1)}`;

export const TODAY_INDEX = JOURNAL_DAYS.findIndex((d) => d.isoKey === todayIsoKey);
