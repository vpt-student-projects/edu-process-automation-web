namespace VPTAPIEdu.Dtos
{
     public class LessonDto
    {
        public int Id { get; set; }
        public DateOnly Date { get; set; }
        public int Number { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;
        public string? Classroom { get; set; }
        public string? Comment { get; set; }
    }
}
