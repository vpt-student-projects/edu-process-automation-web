namespace VPTAPIEdu.Models
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("Grade")]
    public class Grade
    {
        [Key]
        public int Id { get; set; }
        public int StudentId { get; set; }
        [Column("Grade")]
        public int GradeValue { get; set; }
        public DateOnly? Date { get; set; }
        public int? SubjectId { get; set; }

        [ForeignKey("StudentId")]
        public Student? Student { get; set; }

        [ForeignKey("SubjectId")]
        public Subject? Subject { get; set; }
    }
}
