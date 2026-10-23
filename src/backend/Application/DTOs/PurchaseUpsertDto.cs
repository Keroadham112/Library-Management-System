using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs;

public sealed class PurchaseUpsertDto
{
    [Range(1, int.MaxValue)]
    public int SupplierId { get; set; }

    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal UnitCost { get; set; }

    public DateTime PurchaseDate { get; set; }
}
