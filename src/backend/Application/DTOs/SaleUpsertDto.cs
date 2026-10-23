using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs;

public sealed class SaleUpsertItemDto
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal UnitPrice { get; set; }
}

public sealed class SaleUpsertDto
{
    [Range(1, int.MaxValue)]
    public int CustomerId { get; set; }

    public DateTime SaleDate { get; set; }

    [Required]
    [MinLength(1)]
    public List<SaleUpsertItemDto> Items { get; set; } = new();
}