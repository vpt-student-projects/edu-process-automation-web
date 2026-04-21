namespace VPTAPIEdu.Controllers
{
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using System.Security.Claims;
    using VPTAPIEdu.Data;
    using VPTAPIEdu.Dtos;
    using VPTAPIEdu.Models;

    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "teacher,admin")]
    public class TeacherController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TeacherController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        // GET: api/teacher/lessons/my
        [HttpGet("lessons/my")]
        public async Task<IActionResult> GetMyLessons([FromQuery] DateOnly? from, [FromQuery] DateOnly? to)
        {
            var userId = GetCurrentUserId();
            var query = _context.Lessons
                .Include(l => l.Subject)
                .Include(l => l.Group)
                .Where(l => l.UserId == userId);

            if (from.HasValue)
                query = query.Where(l => l.Date >= from.Value);
            if (to.HasValue)
                query = query.Where(l => l.Date <= to.Value);

            var lessons = await query
                .OrderBy(l => l.Date)
                .ThenBy(l => l.Number)
                .Select(l => new LessonDto
                {
                    Id = l.Id,
                    Date = l.Date,
                    Number = l.Number,
                    SubjectName = l.Subject != null ? l.Subject.Name : "",
                    GroupName = l.Group != null ? l.Group.Name : "",
                    Classroom = l.Classroom,
                    Comment = l.Comment
                })
                .ToListAsync();

            return Ok(lessons);
        }

        // GET: api/teacher/lessons/{id}/students
        [HttpGet("lessons/{id}/students")]
        public async Task<IActionResult> GetLessonStudents(int id)
        {
            var userId = GetCurrentUserId();
            var lesson = await _context.Lessons
                .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

            if (lesson == null)
                return NotFound(new { message = "Lesson not found" });

            var students = await _context.Students
                .Where(s => s.GroupId == lesson.GroupId)
                .Select(s => new StudentWithAttendanceDto
                {
                    Id = s.Id,
                    FullName = s.FullName,
                    AttendanceTypeId = _context.Attendances
                        .Where(a => a.LessonId == id && a.StudentId == s.Id)
                        .Select(a => a.TypeId)
                        .FirstOrDefault(),
                    AttendanceTypeName = _context.Attendances
                        .Where(a => a.LessonId == id && a.StudentId == s.Id)
                        .Select(a => a.Type != null ? a.Type.Name : null)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(students);
        }

        // POST: api/teacher/grades
        [HttpPost("grades")]
        public async Task<IActionResult> CreateGrade([FromBody] CreateGradeDto dto)
        {
            var grade = new Grade
            {
                StudentId = dto.StudentId,
                GradeValue = dto.Grade,
                SubjectId = dto.SubjectId,
                Date = dto.Date ?? DateOnly.FromDateTime(DateTime.Today)
            };

            _context.Grades.Add(grade);
            await _context.SaveChangesAsync();

            return Ok(new { id = grade.Id, message = "Grade added" });
        }

        // POST: api/teacher/attendance
        [HttpPost("attendance")]
        public async Task<IActionResult> CreateAttendance([FromBody] CreateAttendanceDto dto)
        {
            var existing = await _context.Attendances
                .FirstOrDefaultAsync(a => a.LessonId == dto.LessonId && a.StudentId == dto.StudentId);

            if (existing != null)
            {
                existing.TypeId = dto.TypeId;
                _context.Attendances.Update(existing);
            }
            else
            {
                var attendance = new Attendance
                {
                    LessonId = dto.LessonId,
                    StudentId = dto.StudentId,
                    TypeId = dto.TypeId
                };
                _context.Attendances.Add(attendance);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Attendance saved" });
        }

        // GET: api/teacher/groups/my
        [HttpGet("groups/my")]
        public async Task<IActionResult> GetMyGroups()
        {
            var userId = GetCurrentUserId();

            var groups = await _context.UserGroupSubjects
                .Where(ugs => ugs.UserId == userId)
                .Select(ugs => ugs.Group)
                .Distinct()
                .Select(g => new { g.Id, g.Name })
                .ToListAsync();

            return Ok(groups);
        }

        // GET: api/teacher/students/by-group/{groupId}
        [HttpGet("students/by-group/{groupId}")]
        public async Task<IActionResult> GetStudentsByGroup(int groupId)
        {
            var students = await _context.Students
                .Where(s => s.GroupId == groupId)
                .Select(s => new { s.Id, s.FullName })
                .ToListAsync();

            return Ok(students);
        }

        // GET: api/teacher/grades/student/{studentId}
        [HttpGet("grades/student/{studentId}")]
        public async Task<IActionResult> GetStudentGrades(int studentId)
        {
            var grades = await _context.Grades
                .Include(g => g.Subject)
                .Where(g => g.StudentId == studentId)
                .Select(g => new GradeDto
                {
                    Id = g.Id,
                    Grade = g.GradeValue,
                    Date = g.Date,
                    SubjectName = g.Subject != null ? g.Subject.Name : ""
                })
                .OrderByDescending(g => g.Date)
                .ToListAsync();

            return Ok(grades);
        }

        // GET: api/teacher/attendance-types
        [HttpGet("attendance-types")]
        public async Task<IActionResult> GetAttendanceTypes()
        {
            var types = await _context.AttendanceTypes
                .Select(t => new { t.Id, t.Name })
                .ToListAsync();

            return Ok(types);
        }
    }
}
