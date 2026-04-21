namespace VPTAPIEdu.Models
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("Subject")]
    public class Subject
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int? Total_hours { get; set; }
    }
}
