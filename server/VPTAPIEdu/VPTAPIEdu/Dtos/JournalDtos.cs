namespace VPTAPIEdu.Dtos
{
    public class JournalSubjectFilterDto
    {
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
    }

    public class JournalGroupFilterDto
    {
        public int GroupId { get; set; }
        public string GroupName { get; set; } = string.Empty;
        public List<JournalSubjectFilterDto> Subjects { get; set; } = new();
    }

    public class JournalAttendanceTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class JournalFiltersResponseDto
    {
        public List<JournalGroupFilterDto> Groups { get; set; } = new();
        public List<JournalAttendanceTypeDto> AttendanceTypes { get; set; } = new();
    }

    public class JournalLessonItemDto
    {
        public int LessonId { get; set; }
        public DateOnly Date { get; set; }
        public int Number { get; set; }
    }

    public class JournalGradeItemDto
    {
        public DateOnly Date { get; set; }
        public int Grade { get; set; }
    }

    public class JournalAttendanceItemDto
    {
        public int LessonId { get; set; }
        public DateOnly Date { get; set; }
        public int? AttendanceTypeId { get; set; }
        public string? AttendanceTypeName { get; set; }
    }

    public class JournalStudentItemDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public List<JournalGradeItemDto> Grades { get; set; } = new();
        public List<JournalAttendanceItemDto> Attendances { get; set; } = new();
    }

    public class JournalDataResponseDto
    {
        public int GroupId { get; set; }
        public int SubjectId { get; set; }
        public List<JournalLessonItemDto> Lessons { get; set; } = new();
        public List<JournalStudentItemDto> Students { get; set; } = new();
    }
}
