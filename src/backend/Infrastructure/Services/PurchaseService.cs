using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Application.Results;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Services;

public sealed class PurchaseService(AppDbContext dbContext) : IPurchaseService
{
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    public async Task<PurchaseListResponseDto> GetAllAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

        var query = dbContext.Purchases
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(purchase =>
                EF.Functions.Like(purchase.Product.Name, $"%{searchTerm}%") ||
                EF.Functions.Like(purchase.Supplier.Name, $"%{searchTerm}%") ||
                EF.Functions.Like(purchase.Supplier.Company, $"%{searchTerm}%"));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);
        var items = await query
            .OrderByDescending(purchase => purchase.PurchaseDate)
            .ThenByDescending(purchase => purchase.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(purchase => new PurchaseDto
            {
                Id = purchase.Id,
                SupplierId = purchase.SupplierId,
                SupplierName = purchase.Supplier.Name,
                ProductId = purchase.ProductId,
                ProductName = purchase.Product.Name,
                Quantity = purchase.Quantity,
                UnitCost = purchase.UnitCost,
                TotalCost = purchase.Quantity * purchase.UnitCost,
                PurchaseDate = purchase.PurchaseDate,
                CreatedAt = purchase.CreatedAt,
                UpdatedAt = purchase.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return new PurchaseListResponseDto
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<PurchaseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Purchases
            .AsNoTracking()
            .Where(purchase => purchase.Id == id)
            .Select(purchase => new PurchaseDto
            {
                Id = purchase.Id,
                SupplierId = purchase.SupplierId,
                SupplierName = purchase.Supplier.Name,
                ProductId = purchase.ProductId,
                ProductName = purchase.Product.Name,
                Quantity = purchase.Quantity,
                UnitCost = purchase.UnitCost,
                TotalCost = purchase.Quantity * purchase.UnitCost,
                PurchaseDate = purchase.PurchaseDate,
                CreatedAt = purchase.CreatedAt,
                UpdatedAt = purchase.UpdatedAt
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<PurchaseMutationResult> CreateAsync(PurchaseUpsertDto dto, CancellationToken cancellationToken = default)
    {
        if (!await dbContext.Suppliers.AnyAsync(supplier => supplier.Id == dto.SupplierId, cancellationToken))
        {
            return new PurchaseMutationResult(PurchaseMutationStatus.InvalidSupplier);
        }

        var product = await dbContext.Products.SingleOrDefaultAsync(product => product.Id == dto.ProductId, cancellationToken);
        if (product is null)
        {
            return new PurchaseMutationResult(PurchaseMutationStatus.InvalidProduct);
        }

        var now = DateTime.UtcNow;
        var purchase = new Purchase
        {
            SupplierId = dto.SupplierId,
            ProductId = dto.ProductId,
            Quantity = dto.Quantity,
            UnitCost = dto.UnitCost,
            PurchaseDate = dto.PurchaseDate == default ? now : dto.PurchaseDate,
            CreatedAt = now,
            UpdatedAt = now
        };

        product.StockQuantity += dto.Quantity;
        product.UpdatedAt = now;

        dbContext.Purchases.Add(purchase);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new PurchaseMutationResult(PurchaseMutationStatus.Success, await GetByIdAsync(purchase.Id, cancellationToken));
    }

    public async Task<PurchaseMutationResult> UpdateAsync(int id, PurchaseUpsertDto dto, CancellationToken cancellationToken = default)
    {
        var purchase = await dbContext.Purchases.SingleOrDefaultAsync(purchase => purchase.Id == id, cancellationToken);
        if (purchase is null)
        {
            return new PurchaseMutationResult(PurchaseMutationStatus.NotFound);
        }

        if (!await dbContext.Suppliers.AnyAsync(supplier => supplier.Id == dto.SupplierId, cancellationToken))
        {
            return new PurchaseMutationResult(PurchaseMutationStatus.InvalidSupplier);
        }

        var oldProduct = await dbContext.Products.SingleOrDefaultAsync(product => product.Id == purchase.ProductId, cancellationToken);
        var newProduct = await dbContext.Products.SingleOrDefaultAsync(product => product.Id == dto.ProductId, cancellationToken);
        if (newProduct is null)
        {
            return new PurchaseMutationResult(PurchaseMutationStatus.InvalidProduct);
        }

        var now = DateTime.UtcNow;
        if (oldProduct is not null)
        {
            oldProduct.StockQuantity -= purchase.Quantity;
            oldProduct.UpdatedAt = now;
        }

        newProduct.StockQuantity += dto.Quantity;
        newProduct.UpdatedAt = now;

        purchase.SupplierId = dto.SupplierId;
        purchase.ProductId = dto.ProductId;
        purchase.Quantity = dto.Quantity;
        purchase.UnitCost = dto.UnitCost;
        purchase.PurchaseDate = dto.PurchaseDate == default ? purchase.PurchaseDate : dto.PurchaseDate;
        purchase.UpdatedAt = now;

        await dbContext.SaveChangesAsync(cancellationToken);

        return new PurchaseMutationResult(PurchaseMutationStatus.Success, await GetByIdAsync(id, cancellationToken));
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var purchase = await dbContext.Purchases.SingleOrDefaultAsync(purchase => purchase.Id == id, cancellationToken);
        if (purchase is null)
        {
            return false;
        }

        var product = await dbContext.Products.SingleOrDefaultAsync(product => product.Id == purchase.ProductId, cancellationToken);
        if (product is not null)
        {
            product.StockQuantity -= purchase.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
        }

        dbContext.Purchases.Remove(purchase);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
