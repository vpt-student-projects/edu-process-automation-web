namespace VPTAPIEdu.Dtos
{
    public class CreateGradeDto
    {
        public int StudentId { get; set; }
        public int? Grade { get; set; }
        public int SubjectId { get; set; }
        public DateOnly Date { get; set; }
    }
}
