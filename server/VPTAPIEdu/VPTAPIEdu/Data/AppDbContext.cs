namespace VPTAPIEdu.Data
{
    using Microsoft.EntityFrameworkCore;
    using VPTAPIEdu.Models;

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Grade> Grades { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<AttendanceType> AttendanceTypes { get; set; }
        public DbSet<UserGroupSubject> UserGroupSubjects { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserGroupSubject>()
                .HasKey(ugs => new { ugs.UserId, ugs.GroupId, ugs.SubjectId });
        }
    }
}
