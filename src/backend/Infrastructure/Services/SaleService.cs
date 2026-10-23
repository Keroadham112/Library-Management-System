using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Application.Results;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace backend.Infrastructure.Services;

public sealed class SaleService(AppDbContext dbContext) : ISaleService
{
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    public async Task<SaleListResponseDto> GetAllAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

        var query = dbContext.Sales
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(sale =>
                EF.Functions.Like(sale.Customer.Name, $"%{searchTerm}%") ||
                EF.Functions.Like(sale.Customer.Email, $"%{searchTerm}%") ||
                sale.Items.Any(item => EF.Functions.Like(item.Product.Name, $"%{searchTerm}%")));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);
        var items = await query
            .OrderByDescending(sale => sale.SaleDate)
            .ThenByDescending(sale => sale.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToSaleDto())
            .ToListAsync(cancellationToken);

        return new SaleListResponseDto
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<SaleDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Sales
            .AsNoTracking()
            .Where(sale => sale.Id == id)
            .Select(MapToSaleDto())
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<SaleMutationResult> CreateAsync(SaleUpsertDto dto, CancellationToken cancellationToken = default)
    {
        if (!await dbContext.Customers.AnyAsync(customer => customer.Id == dto.CustomerId, cancellationToken))
        {
            return new SaleMutationResult(SaleMutationStatus.InvalidCustomer);
        }

        if (dto.Items.Count == 0)
        {
            return new SaleMutationResult(SaleMutationStatus.InvalidItems);
        }

        var productIds = dto.Items.Select(item => item.ProductId).Distinct().ToList();
        var products = await dbContext.Products
            .Where(product => productIds.Contains(product.Id))
            .ToDictionaryAsync(product => product.Id, cancellationToken);

        if (products.Count != productIds.Count)
        {
            return new SaleMutationResult(SaleMutationStatus.InvalidProduct);
        }

        var requestedQuantities = dto.Items
            .GroupBy(item => item.ProductId)
            .ToDictionary(group => group.Key, group => group.Sum(item => item.Quantity));

        if (HasInsufficientStock(requestedQuantities, products))
        {
            return new SaleMutationResult(SaleMutationStatus.InsufficientStock);
        }

        var now = DateTime.UtcNow;
        var sale = new Sale
        {
            CustomerId = dto.CustomerId,
            SaleDate = dto.SaleDate == default ? now : dto.SaleDate,
            CreatedAt = now,
            UpdatedAt = now,
            Items = dto.Items.Select(item => new SaleItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                CreatedAt = now,
                UpdatedAt = now
            }).ToList()
        };

        foreach (var (productId, quantity) in requestedQuantities)
        {
            var product = products[productId];
            product.StockQuantity -= quantity;
            product.UpdatedAt = now;
        }

        dbContext.Sales.Add(sale);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new SaleMutationResult(SaleMutationStatus.Success, await GetByIdAsync(sale.Id, cancellationToken));
    }

    public async Task<SaleMutationResult> UpdateAsync(int id, SaleUpsertDto dto, CancellationToken cancellationToken = default)
    {
        var sale = await dbContext.Sales
            .Include(existingSale => existingSale.Items)
            .SingleOrDefaultAsync(existingSale => existingSale.Id == id, cancellationToken);
        if (sale is null)
        {
            return new SaleMutationResult(SaleMutationStatus.NotFound);
        }

        if (!await dbContext.Customers.AnyAsync(customer => customer.Id == dto.CustomerId, cancellationToken))
        {
            return new SaleMutationResult(SaleMutationStatus.InvalidCustomer);
        }

        if (dto.Items.Count == 0)
        {
            return new SaleMutationResult(SaleMutationStatus.InvalidItems);
        }

        var existingQuantities = sale.Items
            .GroupBy(item => item.ProductId)
            .ToDictionary(group => group.Key, group => group.Sum(item => item.Quantity));

        var requestedQuantities = dto.Items
            .GroupBy(item => item.ProductId)
            .ToDictionary(group => group.Key, group => group.Sum(item => item.Quantity));

        var productIds = existingQuantities.Keys
            .Union(requestedQuantities.Keys)
            .Distinct()
            .ToList();

        var products = await dbContext.Products
            .Where(product => productIds.Contains(product.Id))
            .ToDictionaryAsync(product => product.Id, cancellationToken);

        if (products.Count != productIds.Count)
        {
            return new SaleMutationResult(SaleMutationStatus.InvalidProduct);
        }

        var now = DateTime.UtcNow;
        foreach (var (productId, quantity) in existingQuantities)
        {
            var product = products[productId];
            product.StockQuantity += quantity;
            product.UpdatedAt = now;
        }

        if (HasInsufficientStock(requestedQuantities, products))
        {
            return new SaleMutationResult(SaleMutationStatus.InsufficientStock);
        }

        foreach (var (productId, quantity) in requestedQuantities)
        {
            var product = products[productId];
            product.StockQuantity -= quantity;
            product.UpdatedAt = now;
        }

        sale.CustomerId = dto.CustomerId;
        sale.SaleDate = dto.SaleDate == default ? sale.SaleDate : dto.SaleDate;
        sale.UpdatedAt = now;

        dbContext.SaleItems.RemoveRange(sale.Items);
        sale.Items = dto.Items.Select(item => new SaleItem
        {
            ProductId = item.ProductId,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            CreatedAt = now,
            UpdatedAt = now
        }).ToList();

        await dbContext.SaveChangesAsync(cancellationToken);

        return new SaleMutationResult(SaleMutationStatus.Success, await GetByIdAsync(id, cancellationToken));
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var sale = await dbContext.Sales
            .Include(existingSale => existingSale.Items)
            .SingleOrDefaultAsync(existingSale => existingSale.Id == id, cancellationToken);
        if (sale is null)
        {
            return false;
        }

        var productIds = sale.Items
            .Select(item => item.ProductId)
            .Distinct()
            .ToList();

        var products = await dbContext.Products
            .Where(product => productIds.Contains(product.Id))
            .ToDictionaryAsync(product => product.Id, cancellationToken);

        var now = DateTime.UtcNow;
        foreach (var item in sale.Items)
        {
            if (!products.TryGetValue(item.ProductId, out var product))
            {
                continue;
            }

            product.StockQuantity += item.Quantity;
            product.UpdatedAt = now;
        }

        dbContext.Sales.Remove(sale);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static bool HasInsufficientStock(IReadOnlyDictionary<int, int> requestedQuantities, IReadOnlyDictionary<int, Product> products)
    {
        foreach (var (productId, quantity) in requestedQuantities)
        {
            if (products[productId].StockQuantity < quantity)
            {
                return true;
            }
        }

        return false;
    }

    private static Expression<Func<Sale, SaleDto>> MapToSaleDto()
    {
        return sale => new SaleDto
        {
            Id = sale.Id,
            CustomerId = sale.CustomerId,
            CustomerName = sale.Customer.Name,
            SaleDate = sale.SaleDate,
            TotalAmount = sale.Items.Sum(item => item.Quantity * item.UnitPrice),
            Items = sale.Items
                .OrderBy(item => item.Id)
                .Select(item => new SaleItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.Product.Name,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.Quantity * item.UnitPrice
                })
                .ToList(),
            CreatedAt = sale.CreatedAt,
            UpdatedAt = sale.UpdatedAt
        };
    }
}