namespace VPTAPIEdu.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using VPTAPIEdu.Dtos;
    using VPTAPIEdu.Services;

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var result = await _authService.LoginAsync(loginDto.Login, loginDto.Password);
            if (result == null)
                return Unauthorized(new { message = "Invalid login or password" });

            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] string refreshToken)
        {
            var result = await _authService.RefreshTokenAsync(refreshToken);
            if (result == null)
                return Unauthorized(new { message = "Invalid refresh token" });

            return Ok(result);
        }
    }
}
