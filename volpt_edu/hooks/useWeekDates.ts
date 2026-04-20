export function useWeekDates(offset: number) {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);

    const monday = new Date(today);
    monday.setDate(diff + offset * 7);

    const dates = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });

    const isToday = (date: Date) =>
        date.toDateString() === today.toDateString();

    const formatDate = (date: Date) =>
        date.toLocaleDateString("ru-RU", { month: "short", day: "numeric" });

    const startDate = dates[0] ?? monday;
    const endDate = dates[dates.length - 1] ?? startDate;
    const weekRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;

    return { dates, isToday, formatDate, weekRange };
}
