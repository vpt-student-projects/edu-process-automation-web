namespace VPTAPIEdu.Models
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("Attendance")]
    public class Attendance
    {
        [Key]
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int TypeId { get; set; }
        public DateOnly Date { get; set; }
        public int SubjectId { get; set; }

        [ForeignKey("SubjectId")]
        public Subject? Subject { get; set; }

        [ForeignKey("StudentId")]
        public Student? Student { get; set; }

        [ForeignKey("TypeId")]
        public AttendanceType? Type { get; set; }
    }
}
