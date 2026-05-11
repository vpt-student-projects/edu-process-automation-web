namespace VPTAPIEdu.Dtos;

public class CreateTeacherDto
{
    public string Login { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Password { get; set; }
}
