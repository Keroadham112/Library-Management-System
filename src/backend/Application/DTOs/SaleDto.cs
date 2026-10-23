namespace backend.Application.DTOs;

public sealed class SaleDto
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public DateTime SaleDate { get; set; }

    public decimal TotalAmount { get; set; }

    public IReadOnlyList<SaleItemDto> Items { get; set; } = Array.Empty<SaleItemDto>();

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}