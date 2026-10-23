using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs;

public sealed class CategoryUpsertDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;
}
