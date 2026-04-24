namespace VPTAPIEdu.Dtos
{
    public class CreateAttendanceDto
    {
        public int LessonId { get; set; }
        public int StudentId { get; set; }
        public int? TypeId { get; set; }
    }
}
