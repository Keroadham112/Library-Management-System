using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace backend.Infrastructure.Services;

public sealed class AuthService(AppDbContext dbContext, IConfiguration configuration) : IAuthService
{
    private const string DefaultAdminUsername = "admin";
    private const string DefaultAdminPassword = "Admin@12345!";
    private const string DefaultAdminRole = "Admin";

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto dto, CancellationToken cancellationToken = default)
    {
        var username = dto.Username.Trim();
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return null;
        }

        var user = await dbContext.Users.SingleOrDefaultAsync(
            existingUser => existingUser.Username == username,
            cancellationToken);

        if (user is null || !user.IsActive)
        {
            return null;
        }

        var passwordHasher = new PasswordHasher<AppUser>();
        var verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return null;
        }

        var (token, expiresAt) = CreateToken(user);
        return new LoginResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = new AuthenticatedUserDto
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role
            }
        };
    }

    public async Task SeedDefaultAdminAsync(CancellationToken cancellationToken = default)
    {
        if (await dbContext.Users.AnyAsync(cancellationToken))
        {
            return;
        }

        var now = DateTime.UtcNow;
        var user = new AppUser
        {
            Username = DefaultAdminUsername,
            Role = DefaultAdminRole,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        var passwordHasher = new PasswordHasher<AppUser>();
        user.PasswordHash = passwordHasher.HashPassword(user, DefaultAdminPassword);

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private (string Token, DateTime ExpiresAt) CreateToken(AppUser user)
    {
        var issuer = configuration["Jwt:Issuer"] ?? "inventory-system";
        var audience = configuration["Jwt:Audience"] ?? "inventory-system";
        var signingKey = configuration["Jwt:Key"] ?? "inventory-system-dev-signing-key-please-change";
        var expiresMinutes = int.TryParse(configuration["Jwt:ExpiresMinutes"], out var parsedMinutes)
            ? parsedMinutes
            : 480;

        var expiresAt = DateTime.UtcNow.AddMinutes(expiresMinutes);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}