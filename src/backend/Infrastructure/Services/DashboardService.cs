using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Services;

public sealed class DashboardService(AppDbContext dbContext) : IDashboardService
{
    public async Task<DashboardStatsDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        // These values come from the product table because every dashboard stat except categories is product-based.
        // TotalProducts = how many product rows exist.
        // TotalInventoryQuantity = the sum of all on-hand units across all products.
        // TotalInventoryCostValue = sum of (cost price * on-hand quantity) for each product.
        // TotalInventorySellingValue = sum of (selling price * on-hand quantity) for each product.
        // LowStockCount = products where the on-hand quantity is at or below the configured threshold.
        var productStats = await dbContext.Products
            .AsNoTracking()
            .GroupBy(_ => 1)
            .Select(group => new
            {
                TotalProducts = group.Count(),
                TotalInventoryQuantity = group.Sum(product => product.StockQuantity),
                TotalInventoryCostValue = group.Sum(product => product.CostPrice * product.StockQuantity),
                TotalInventorySellingValue = group.Sum(product => product.SellingPrice * product.StockQuantity),
                LowStockCount = group.Count(product => product.StockQuantity <= product.LowStockThreshold)
            })
            .SingleOrDefaultAsync(cancellationToken);

        var totalCategories = await dbContext.Categories.CountAsync(cancellationToken);
        var totalSuppliers = await dbContext.Suppliers.CountAsync(cancellationToken);
        var totalCustomers = await dbContext.Customers.CountAsync(cancellationToken);

        return new DashboardStatsDto
        {
            TotalProducts = productStats?.TotalProducts ?? 0,
            TotalCategories = totalCategories,
            TotalSuppliers = totalSuppliers,
            TotalCustomers = totalCustomers,
            TotalInventoryQuantity = productStats?.TotalInventoryQuantity ?? 0,
            TotalInventoryCostValue = productStats?.TotalInventoryCostValue ?? 0m,
            TotalInventorySellingValue = productStats?.TotalInventorySellingValue ?? 0m,
            LowStockCount = productStats?.LowStockCount ?? 0
        };
    }
}
