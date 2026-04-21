namespace VPTAPIEdu.Dtos
{
    public class GradeDto
    {
        public int Id { get; set; }
        public int Grade { get; set; }
        public DateOnly? Date { get; set; }
        public string? SubjectName { get; set; }
    }
}
