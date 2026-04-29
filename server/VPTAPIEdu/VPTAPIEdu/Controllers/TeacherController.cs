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

        [HttpGet("journal/filters")]
        public async Task<IActionResult> GetJournalFilters()
        {
            var userId = GetCurrentUserId();

            var links = await _context.UserGroupSubjects
                .Where(ugs => ugs.UserId == userId)
                .Include(ugs => ugs.Group)
                .Include(ugs => ugs.Subject)
                .ToListAsync();

            var groups = links
                .Where(ugs => ugs.Group != null)
                .GroupBy(ugs => new { ugs.GroupId, GroupName = ugs.Group!.Name })
                .Select(group => new JournalGroupFilterDto
                {
                    GroupId = group.Key.GroupId,
                    GroupName = group.Key.GroupName,
                    Subjects = group
                        .Where(item => item.Subject != null)
                        .GroupBy(item => new { item.SubjectId, SubjectName = item.Subject!.Name })
                        .Select(subject => new JournalSubjectFilterDto
                        {
                            SubjectId = subject.Key.SubjectId,
                            SubjectName = subject.Key.SubjectName
                        })
                        .OrderBy(subject => subject.SubjectName)
                        .ToList()
                })
                .OrderBy(group => group.GroupName)
                .ToList();

            var attendanceTypes = await _context.AttendanceTypes
                .OrderBy(t => t.Id)
                .Select(t => new JournalAttendanceTypeDto
                {
                    Id = t.Id,
                    Name = t.Name
                })
                .ToListAsync();

            return Ok(new JournalFiltersResponseDto
            {
                Groups = groups,
                AttendanceTypes = attendanceTypes
            });
        }

        [HttpGet("journal")]
        public async Task<IActionResult> GetJournalData(
            [FromQuery] int groupId,
            [FromQuery] int subjectId,
            [FromQuery] DateOnly? from,
            [FromQuery] DateOnly? to)
        {
            var userId = GetCurrentUserId();

            var hasAccess = await _context.UserGroupSubjects
                .AnyAsync(ugs =>
                    ugs.UserId == userId &&
                    ugs.GroupId == groupId &&
                    ugs.SubjectId == subjectId);

            if (!hasAccess)
                return Forbid();

            var dateFrom = from ?? DateOnly.FromDateTime(DateTime.Today.AddMonths(-3));
            var dateTo = to ?? DateOnly.FromDateTime(DateTime.Today.AddMonths(1));

            var lessons = await _context.Lessons
                .Where(l =>
                    l.UserId == userId &&
                    l.GroupId == groupId &&
                    l.SubjectId == subjectId &&
                    l.Date >= dateFrom &&
                    l.Date <= dateTo)
                .OrderBy(l => l.Date)
                .ThenBy(l => l.Number)
                .Select(l => new JournalLessonItemDto
                {
                    LessonId = l.Id,
                    Date = l.Date,
                    Number = l.Number
                })
                .ToListAsync();

            var students = await _context.Students
                .Where(s => s.GroupId == groupId)
                .OrderBy(s => s.FullName)
                .Select(s => new { s.Id, s.FullName })
                .ToListAsync();

            var studentIds = students.Select(s => s.Id).ToList();

            var grades = await _context.Grades
                .Where(g =>
                    studentIds.Contains(g.StudentId) &&
                    g.SubjectId == subjectId &&
                    g.Date >= dateFrom &&
                    g.Date <= dateTo)
                .Select(g => new
                {
                    g.StudentId,
                    Date = g.Date,
                    Grade = g.GradeValue
                })
                .ToListAsync();

            var attendances = await _context.Attendances
                .Where(a => a.SubjectId == subjectId && studentIds.Contains(a.StudentId) && a.Date >= dateFrom &&
                    a.Date <= dateTo)
                .Include(a => a.Type)
                .Select(a => new
                {
                    a.StudentId,
                    a.SubjectId,
                    Date = a.Date,
                    a.TypeId,
                    TypeName = a.Type != null ? a.Type.Name : null
                })
                .ToListAsync();

            var response = new JournalDataResponseDto
            {
                GroupId = groupId,
                SubjectId = subjectId,
                Lessons = lessons,
                Students = students.Select(student => new JournalStudentItemDto
                {
                    Id = student.Id,
                    FullName = student.FullName,
                    Grades = grades
                        .Where(g => g.StudentId == student.Id)
                        .Select(g => new JournalGradeItemDto
                        {
                            Date = g.Date,
                            Grade = g.Grade
                        })
                        .OrderBy(g => g.Date)
                        .ToList(),
                    Attendances = attendances
                        .Where(a => a.StudentId == student.Id)
                        .Select(a => new JournalAttendanceItemDto
                        {
                            SubjectId = a.SubjectId,
                            Date = a.Date,
                            AttendanceTypeId = a.TypeId,
                            AttendanceTypeName = a.TypeName
                        })
                        .OrderBy(a => a.Date)
                        .ToList()
                }).ToList()
            };

            return Ok(response);
        }

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
                        .Where(a => a.SubjectId == id && a.StudentId == s.Id && a.Date == lesson.Date)
                        .Select(a => a.TypeId)
                        .FirstOrDefault(),
                    AttendanceTypeName = _context.Attendances
                        .Where(a => a.SubjectId == id && a.StudentId == s.Id && a.Date == lesson.Date)
                        .Select(a => a.Type != null ? a.Type.Name : null)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(students);
        }

        [HttpPost("grades")]
        public async Task<IActionResult> CreateGrade([FromBody] CreateGradeDto dto)
        {

            var gradeDate = dto.Date;

            var existing = await _context.Grades
                .FirstOrDefaultAsync(g =>
                    g.StudentId == dto.StudentId &&
                    g.SubjectId == dto.SubjectId &&
                    g.Date == gradeDate);

            if (!dto.Grade.HasValue)
            {
                if (existing != null)
                {
                    _context.Grades.Remove(existing);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Grade removed" });
            }

            if (existing != null)
            {
                existing.GradeValue = dto.Grade.Value;
                _context.Grades.Update(existing);
                await _context.SaveChangesAsync();
                return Ok(new { id = existing.Id, message = "Grade updated" });
            }

            var grade = new Grade
            {
                StudentId = dto.StudentId,
                GradeValue = dto.Grade.Value,
                SubjectId = dto.SubjectId,
                Date = gradeDate
            };

            _context.Grades.Add(grade);
            await _context.SaveChangesAsync();

            return Ok(new { id = grade.Id, message = "Grade added" });
        }

        [HttpPost("attendance")]
        public async Task<IActionResult> CreateAttendance([FromBody] CreateAttendanceDto dto)
        {
            var userId = GetCurrentUserId();
            

            var AttendanceDate = dto.Date;

            var existing = await _context.Attendances
                .FirstOrDefaultAsync(a => a.SubjectId == dto.SubjectId && a.StudentId == dto.StudentId && a.Date == dto.Date);

            if (!dto.TypeId.HasValue)
            {
                if (existing != null)
                {
                    _context.Attendances.Remove(existing);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { message = "Attendance removed" });
            }

            if (existing != null)
            {
                existing.TypeId = dto.TypeId.Value;
                _context.Attendances.Update(existing);
            }
            else
            {
                var attendance = new Attendance
                {
                    SubjectId = dto.SubjectId,
                    StudentId = dto.StudentId,
                    TypeId = dto.TypeId.Value,
                    Date = AttendanceDate
                };
                _context.Attendances.Add(attendance);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Attendance saved" });
        }

        [HttpGet("groups/my")]
        public async Task<IActionResult> GetMyGroups()
        {
            var userId = GetCurrentUserId();

            var groups = await _context.UserGroupSubjects
                .Where(ugs => ugs.UserId == userId)
                .Select(ugs => ugs.Group)
                .Distinct()
                .Select(g => new { g!.Id, g.Name })
                .ToListAsync();

            return Ok(groups);
        }

        [HttpGet("students/by-group/{groupId}")]
        public async Task<IActionResult> GetStudentsByGroup(int groupId)
        {
            var students = await _context.Students
                .Where(s => s.GroupId == groupId)
                .Select(s => new { s.Id, s.FullName })
                .ToListAsync();

            return Ok(students);
        }

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
