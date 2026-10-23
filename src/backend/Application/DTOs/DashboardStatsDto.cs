namespace backend.Application.DTOs;

public sealed class DashboardStatsDto
{
    public int TotalProducts { get; set; }

    public int TotalCategories { get; set; }

    public int TotalSuppliers { get; set; }   // جديد

    public int TotalCustomers { get; set; }

    public int TotalInventoryQuantity { get; set; }

    public decimal TotalInventoryCostValue { get; set; }

    public decimal TotalInventorySellingValue { get; set; }

    public int LowStockCount { get; set; }
}