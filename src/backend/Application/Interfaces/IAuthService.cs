using backend.Application.DTOs;

namespace backend.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto dto, CancellationToken cancellationToken = default);

    Task SeedDefaultAdminAsync(CancellationToken cancellationToken = default);
}