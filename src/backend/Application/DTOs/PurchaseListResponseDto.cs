namespace backend.Application.DTOs;

public sealed class PurchaseListResponseDto
{
    public IReadOnlyList<PurchaseDto> Items { get; set; } = Array.Empty<PurchaseDto>();

    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalCount { get; set; }

    public int TotalPages { get; set; }
}
