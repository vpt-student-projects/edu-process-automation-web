export interface StudentDto {
    id: string;
    name: string;
    grades: (number | null)[];
    attendance: (boolean | null)[];
}

export interface GroupDto {
    id: string;
    name: string;
    subjects: string[];
}

export interface LessonDto {
    id: string;
    subject: string;
    group: string;
    room: string;
    pairNumber: number;
}

export interface ScheduleDayDto {
    dayName: string;
    lessons: LessonDto[];
}
