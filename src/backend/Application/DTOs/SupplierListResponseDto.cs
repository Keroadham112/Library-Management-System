namespace backend.Application.DTOs;

public sealed class SupplierListResponseDto
{
    public IReadOnlyList<SupplierDto> Items { get; set; } = Array.Empty<SupplierDto>();

    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalCount { get; set; }

    public int TotalPages { get; set; }
}
