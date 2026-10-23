namespace backend.Application.DTOs;

public sealed class AuthenticatedUserDto
{
    public int Id { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;
}