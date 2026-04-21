namespace VPTAPIEdu.Dtos
{
    public class StudentWithAttendanceDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int? AttendanceTypeId { get; set; }
        public string? AttendanceTypeName { get; set; }
    }
}
