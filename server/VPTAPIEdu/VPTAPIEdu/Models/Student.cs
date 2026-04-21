namespace VPTAPIEdu.Models
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("Student")]
    public class Student
    {
        [Key]
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int GroupId { get; set; }

        [ForeignKey("GroupId")]
        public Group? Group { get; set; }
    }
}
