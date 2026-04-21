namespace VPTAPIEdu.Models
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("Lesson")]
    public class Lesson
    {
        [Key]
        public int Id { get; set; }
        public DateOnly Date { get; set; }
        public int Number { get; set; }
        public int UserId { get; set; }
        public int SubjectId { get; set; }
        public int GroupId { get; set; }
        public int? TopicId { get; set; }
        public string? Classroom { get; set; }
        public string? Comment { get; set; }

        [ForeignKey("UserId")]
        public User? Teacher { get; set; }

        [ForeignKey("SubjectId")]
        public Subject? Subject { get; set; }

        [ForeignKey("GroupId")]
        public Group? Group { get; set; }
    }
}
