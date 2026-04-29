namespace VPTAPIEdu.Dtos
{
    public class CreateAttendanceDto
    {
        public int SubjectId { get; set; }
        public int StudentId { get; set; }
        public DateOnly Date { get; set; }
        public int? TypeId { get; set; }
    }
}
