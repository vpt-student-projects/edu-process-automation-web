using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using VPTAPIEdu.Data;
using VPTAPIEdu.Dtos;
using VPTAPIEdu.Models;

namespace VolptEDUAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AdminController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    

    // 1. Импорт студентов из списка (CSV/текст)
    [HttpPost("students/import")]
    public async Task<IActionResult> ImportStudents([FromBody] ImportStudentsDto dto)
    {
        var lines = dto.StudentList.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        var added = new List<string>();
        var errors = new List<string>();

        foreach (var line in lines)
        {
            var parts = line.Trim().Split(new[] { ',', '\t' }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length < 2)
            {
                errors.Add($"Неверный формат: {line}");
                continue;
            }

            var fullName = parts[0].Trim();
            var groupName = parts[1].Trim();

            var group = await _context.Groups.FirstOrDefaultAsync(g => g.Name == groupName);
            if (group == null)
            {
                // Создаём группу, если нет
                group = new Group { Name = groupName };
                _context.Groups.Add(group);
                await _context.SaveChangesAsync();
            }

            var existing = await _context.Students.FirstOrDefaultAsync(s => s.FullName == fullName && s.GroupId == group.Id);
            if (existing != null)
            {
                errors.Add($"Студент уже существует: {fullName}");
                continue;
            }

            var student = new Student { FullName = fullName, GroupId = group.Id };
            _context.Students.Add(student);
            added.Add(fullName);
        }

        await _context.SaveChangesAsync();
        return Ok(new { added, errors, addedCount = added.Count, errorsCount = errors.Count });
    }

    // 2. Добавление студента по одному
    [HttpPost("students")]
    public async Task<IActionResult> AddStudent([FromBody] CreateStudentDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
            return BadRequest(new { message = "Имя студента обязательно" });

        var group = await _context.Groups.FirstOrDefaultAsync(g => g.Name == dto.GroupName);
        if (group == null)
        {
            group = new Group { Name = dto.GroupName };
            _context.Groups.Add(group);
            await _context.SaveChangesAsync();
        }

        var existing = await _context.Students
            .FirstOrDefaultAsync(s => s.FullName == dto.FullName && s.GroupId == group.Id);

        if (existing != null)
            return BadRequest(new { message = "Студент уже существует в этой группе" });

        var student = new Student { FullName = dto.FullName, GroupId = group.Id };
        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        return Ok(new { id = student.Id, fullName = student.FullName, groupName = group.Name });
    }

    // 3. Удаление студента
    [HttpDelete("students/{id}")]
    public async Task<IActionResult> DeleteStudent(int id)
    {
        var student = await _context.Students.FindAsync(id);
        if (student == null)
            return NotFound(new { message = "Студент не найден" });

        _context.Students.Remove(student);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Студент удалён" });
    }

    // Получить всех студентов
    [HttpGet("students")]
    public async Task<IActionResult> GetAllStudents()
    {
        var students = await _context.Students
            .Include(s => s.Group)
            .Select(s => new { s.Id, s.FullName, GroupName = s.Group != null ? s.Group.Name : "" })
            .ToListAsync();
        return Ok(students);
    }

    // 4. Добавление преподавателя
    [HttpPost("teachers")]
    public async Task<IActionResult> AddTeacher([FromBody] CreateTeacherDto dto)
    {
        // Проверка на существующего пользователя
        var existing = await _context.Users.FirstOrDefaultAsync(u => u.Login == dto.Login);
        if (existing != null)
            return BadRequest(new { message = "Пользователь с таким логином уже существует" });

        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "teacher");
        if (role == null)
        {
            role = new Role { Name = "teacher" };
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
        }

        var user = new User
        {
            Login = dto.Login,
            FullName = dto.FullName,
            RoleId = role.Id,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password ?? "default123")
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { user.Id, user.Login, user.FullName, message = "Преподаватель добавлен" });
    }

    // 5. Удаление преподавателя
    [HttpDelete("teachers/{id}")]
    public async Task<IActionResult> DeleteTeacher(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Преподаватель не найден" });

        if (user.RoleId != 2) // teacher role
            return BadRequest(new { message = "Этот пользователь не преподаватель" });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Преподаватель удалён" });
    }

    // Получить всех преподавателей
    [HttpGet("teachers")]
    public async Task<IActionResult> GetAllTeachers()
    {
        var teacherRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "teacher");
        if (teacherRole == null)
            return Ok(new List<object>());

        var teachers = await _context.Users
            .Where(u => u.RoleId == teacherRole.Id)
            .Select(u => new { u.Id, u.Login, u.FullName })
            .ToListAsync();
        return Ok(teachers);
    }

    // 6. Добавление предмета
    [HttpPost("subjects")]
    public async Task<IActionResult> AddSubject([FromBody] CreateSubjectDto dto)
    {
        var existing = await _context.Subjects.FirstOrDefaultAsync(s => s.Name == dto.Name);
        if (existing != null)
            return BadRequest(new { message = "Предмет уже существует" });

        var subject = new Subject
        {
            Name = dto.Name,
            Total_hours = dto.TotalHours
        };

        _context.Subjects.Add(subject);
        await _context.SaveChangesAsync();

        return Ok(new { subject.Id, subject.Name, subject.Total_hours });
    }

    // 7. Изменение названия предмета
    [HttpPut("subjects/{id}")]
    public async Task<IActionResult> UpdateSubject(int id, [FromBody] UpdateSubjectDto dto)
    {
        var subject = await _context.Subjects.FindAsync(id);
        if (subject == null)
            return NotFound(new { message = "Предмет не найден" });

        subject.Name = dto.Name;
        if (dto.TotalHours.HasValue)
            subject.Total_hours = dto.TotalHours;

        await _context.SaveChangesAsync();
        return Ok(new { subject.Id, subject.Name, subject.Total_hours });
    }

    // 8. Удаление предмета
    [HttpDelete("subjects/{id}")]
    public async Task<IActionResult> DeleteSubject(int id)
    {
        var subject = await _context.Subjects.FindAsync(id);
        if (subject == null)
            return NotFound(new { message = "Предмет не найден" });

        _context.Subjects.Remove(subject);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Предмет удалён" });
    }

    // Получить все предметы
    [HttpGet("subjects")]
    public async Task<IActionResult> GetAllSubjects()
    {
        var subjects = await _context.Subjects
            .Select(s => new { s.Id, s.Name, s.Total_hours })
            .ToListAsync();
        return Ok(subjects);
    }

    // Получить все группы
    [HttpGet("groups")]
    public async Task<IActionResult> GetAllGroups()
    {
        var groups = await _context.Groups
            .Select(g => new { g.Id, g.Name, StudentsCount = _context.Students.Count(s => s.GroupId == g.Id) })
            .ToListAsync();
        return Ok(groups);
    }

    // Добавить группу
    [HttpPost("groups")]
    public async Task<IActionResult> AddGroup([FromBody] CreateGroupDto dto)
    {
        var existing = await _context.Groups.FirstOrDefaultAsync(g => g.Name == dto.Name);
        if (existing != null)
            return BadRequest(new { message = "Группа уже существует" });

        var group = new Group { Name = dto.Name };
        _context.Groups.Add(group);
        await _context.SaveChangesAsync();

        return Ok(new { group.Id, group.Name });
    }

    // Удалить группу
    [HttpDelete("groups/{id}")]
    public async Task<IActionResult> DeleteGroup(int id)
    {
        var group = await _context.Groups.FindAsync(id);
        if (group == null)
            return NotFound(new { message = "Группа не найдена" });

        // Проверяем, есть ли студенты в группе
        var hasStudents = await _context.Students.AnyAsync(s => s.GroupId == id);
        if (hasStudents)
            return BadRequest(new { message = "Нельзя удалить группу, в которой есть студенты" });

        _context.Groups.Remove(group);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Группа удалена" });
    }


    // Смена логина у любого пользователя
    [HttpPut("users/{id}/login")]
    public async Task<IActionResult> ChangeLogin(int id, [FromBody] ChangeLoginDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Пользователь не найден" });

        var existing = await _context.Users.FirstOrDefaultAsync(u => u.Login == dto.NewLogin && u.Id != id);
        if (existing != null)
            return BadRequest(new { message = "Логин уже занят" });

        user.Login = dto.NewLogin;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Логин изменён", user.Login });
    }

    // Смена пароля у любого пользователя (админом)
    [HttpPut("users/{id}/password")]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Пользователь не найден" });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Пароль изменён" });
    }
}
