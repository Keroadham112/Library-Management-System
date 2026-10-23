using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Application.Results;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Services;

public sealed class ProductService(AppDbContext dbContext) : IProductService
{
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    public async Task<ProductListResponseDto> GetAllAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

        var query = dbContext.Products
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(product => EF.Functions.Like(product.Name, $"%{searchTerm}%"));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);
        var items = await query
            .OrderBy(product => product.Name)
            .ThenBy(product => product.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(product => new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name,
                StockQuantity = product.StockQuantity,
                CostPrice = product.CostPrice,
                SellingPrice = product.SellingPrice,
                Barcode = product.Barcode,
                SKU = product.SKU,
                LowStockThreshold = product.LowStockThreshold,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return new ProductListResponseDto
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<ProductDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Products
            .AsNoTracking()
            .Where(product => product.Id == id)
            .Select(product => new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name,
                StockQuantity = product.StockQuantity,
                CostPrice = product.CostPrice,
                SellingPrice = product.SellingPrice,
                Barcode = product.Barcode,
                SKU = product.SKU,
                LowStockThreshold = product.LowStockThreshold,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<ProductMutationResult> CreateAsync(ProductUpsertDto dto, CancellationToken cancellationToken = default)
    {
        var categoryExists = await dbContext.Categories.AnyAsync(category => category.Id == dto.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            return new ProductMutationResult(ProductMutationStatus.InvalidCategory);
        }

        if (await IsDuplicateAsync(null, dto.SKU, dto.Barcode, cancellationToken))
        {
            return new ProductMutationResult(ProductMutationStatus.Conflict);
        }

        var now = DateTime.UtcNow;
        var product = new Product
        {
            Name = dto.Name.Trim(),
            CategoryId = dto.CategoryId,
            StockQuantity = dto.StockQuantity,
            CostPrice = dto.CostPrice,
            SellingPrice = dto.SellingPrice,
            Barcode = dto.Barcode.Trim(),
            SKU = dto.SKU.Trim(),
            LowStockThreshold = dto.LowStockThreshold,
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync(cancellationToken);

        var createdProduct = await GetByIdAsync(product.Id, cancellationToken);
        return new ProductMutationResult(ProductMutationStatus.Success, createdProduct);
    }

    public async Task<ProductMutationResult> UpdateAsync(int id, ProductUpsertDto dto, CancellationToken cancellationToken = default)
    {
        var product = await dbContext.Products.SingleOrDefaultAsync(product => product.Id == id, cancellationToken);
        if (product is null)
        {
            return new ProductMutationResult(ProductMutationStatus.NotFound);
        }

        var categoryExists = await dbContext.Categories.AnyAsync(category => category.Id == dto.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            return new ProductMutationResult(ProductMutationStatus.InvalidCategory);
        }

        if (await IsDuplicateAsync(id, dto.SKU, dto.Barcode, cancellationToken))
        {
            return new ProductMutationResult(ProductMutationStatus.Conflict);
        }

        product.Name = dto.Name.Trim();
        product.CategoryId = dto.CategoryId;
        product.StockQuantity = dto.StockQuantity;
        product.CostPrice = dto.CostPrice;
        product.SellingPrice = dto.SellingPrice;
        product.Barcode = dto.Barcode.Trim();
        product.SKU = dto.SKU.Trim();
        product.LowStockThreshold = dto.LowStockThreshold;
        product.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        var updatedProduct = await GetByIdAsync(id, cancellationToken);
        return new ProductMutationResult(ProductMutationStatus.Success, updatedProduct);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await dbContext.Products.SingleOrDefaultAsync(product => product.Id == id, cancellationToken);
        if (product is null)
        {
            return false;
        }

        dbContext.Products.Remove(product);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task<bool> IsDuplicateAsync(int? currentProductId, string sku, string barcode, CancellationToken cancellationToken)
    {
        var normalizedSku = sku.Trim();
        var normalizedBarcode = barcode.Trim();

        return await dbContext.Products.AnyAsync(product =>
            product.Id != currentProductId &&
            (product.SKU == normalizedSku || product.Barcode == normalizedBarcode), cancellationToken);
    }
}
