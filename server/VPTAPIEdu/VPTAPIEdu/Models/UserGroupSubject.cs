namespace VPTAPIEdu.Models
{
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("UserGroupSubject")]
    public class UserGroupSubject
    {
        public int UserId { get; set; }
        public int GroupId { get; set; }
        public int SubjectId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }

        [ForeignKey(nameof(GroupId))]
        public virtual Group? Group { get; set; }

        [ForeignKey(nameof(SubjectId))]
        public virtual Subject? Subject { get; set; }
    }
}
