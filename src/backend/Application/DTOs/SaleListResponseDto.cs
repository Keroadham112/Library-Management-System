namespace backend.Application.DTOs;

public sealed class SaleListResponseDto
{
    public IReadOnlyList<SaleDto> Items { get; set; } = Array.Empty<SaleDto>();

    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalCount { get; set; }

    public int TotalPages { get; set; }
}