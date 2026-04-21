namespace VPTAPIEdu.Models
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("User")]
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Login { get; set; } = string.Empty;
        public string? PasswordHash { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string? RefreshTokenHash { get; set; }
        public DateTime? TokenExpiresAt { get; set; }

        [ForeignKey("RoleId")]
        public Role? Role { get; set; }
    }
}
