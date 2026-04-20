export interface Student {
    id: string;
    name: string;
    grades: (number | null)[]; // Array of grades
    attendance: (boolean | null)[]; // true = present, false = absent, null = future/unset
}

export interface Lesson {
    id: string;
    subject: string;
    group: string;
    room: string;
    pairNumber: number; // 1-6
}

export interface ScheduleDay {
    dayName: string; // "Monday", etc.
    date: string; // Display string like "Oct 23"
    lessons: Lesson[];
}
export interface DayTemplate {
    dayName: string;
    lessons: Lesson[];
}

export interface GroupSummary {
    id: string;
    name: string;
    subjects: string[];
}

export type ViewState = "LANDING" | "LOGIN" | "SCHEDULE" | "JOURNAL" | "GROUPS";

export type JournalMode = "GRADES" | "ATTENDANCE";

export type SortOption = "NAME" | "SUBJECTS_COUNT";
