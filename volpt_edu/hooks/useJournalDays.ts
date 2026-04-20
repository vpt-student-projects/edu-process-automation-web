// hooks/useJournalDays.ts
export type JournalDay = { label: string; fullDate: Date };

function generateJournalDays(): JournalDay[] {
    const days: JournalDay[] = [];
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    start.setDate(1);
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    const cur = new Date(start);
    while (cur <= end) {
        if (cur.getDay() !== 0) {
            days.push({
                label: `${cur.getDate().toString().padStart(2, "0")}.${(cur.getMonth() + 1).toString().padStart(2, "0")}`,
                fullDate: new Date(cur),
            });
        }
        cur.setDate(cur.getDate() + 1);
    }
    return days;
}

export const JOURNAL_DAYS = generateJournalDays();

export const todayStr = (() => {
    const t = new Date();
    return `${t.getDate().toString().padStart(2, "0")}.${(t.getMonth() + 1).toString().padStart(2, "0")}`;
})();

export const TODAY_INDEX = JOURNAL_DAYS.findIndex((d) => d.label === todayStr);
