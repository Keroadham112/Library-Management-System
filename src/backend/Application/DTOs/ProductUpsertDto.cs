using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs;

public sealed class ProductUpsertDto
{
    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal CostPrice { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal SellingPrice { get; set; }

    [Required]
    [StringLength(32, MinimumLength = 8)]
    public string Barcode { get; set; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string SKU { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int LowStockThreshold { get; set; }
}
