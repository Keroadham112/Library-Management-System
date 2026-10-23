namespace backend.Application.DTOs;

public sealed class CustomerListResponseDto
{
    public IReadOnlyList<CustomerDto> Items { get; set; } = Array.Empty<CustomerDto>();

    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalCount { get; set; }

    public int TotalPages { get; set; }
}
