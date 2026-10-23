using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Services;

public sealed class SupplierService(AppDbContext dbContext) : ISupplierService
{
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    public async Task<SupplierListResponseDto> GetAllAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

        var query = dbContext.Suppliers
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(supplier =>
                EF.Functions.Like(supplier.Name, $"%{searchTerm}%") ||
                EF.Functions.Like(supplier.Company, $"%{searchTerm}%") ||
                EF.Functions.Like(supplier.Email, $"%{searchTerm}%") ||
                EF.Functions.Like(supplier.Phone, $"%{searchTerm}%"));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);
        var items = await query
            .OrderBy(supplier => supplier.Name)
            .ThenBy(supplier => supplier.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(supplier => new SupplierDto
            {
                Id = supplier.Id,
                Name = supplier.Name,
                Company = supplier.Company,
                Email = supplier.Email,
                Phone = supplier.Phone,
                Address = supplier.Address,
                CreatedAt = supplier.CreatedAt,
                UpdatedAt = supplier.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return new SupplierListResponseDto
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<SupplierDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Suppliers
            .AsNoTracking()
            .Where(supplier => supplier.Id == id)
            .Select(supplier => new SupplierDto
            {
                Id = supplier.Id,
                Name = supplier.Name,
                Company = supplier.Company,
                Email = supplier.Email,
                Phone = supplier.Phone,
                Address = supplier.Address,
                CreatedAt = supplier.CreatedAt,
                UpdatedAt = supplier.UpdatedAt
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<SupplierDto> CreateAsync(SupplierUpsertDto dto, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var supplier = new Supplier
        {
            Name = dto.Name.Trim(),
            Company = dto.Company.Trim(),
            Email = dto.Email.Trim(),
            Phone = dto.Phone.Trim(),
            Address = dto.Address.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.Suppliers.Add(supplier);
        await dbContext.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(supplier.Id, cancellationToken))!;
    }

    public async Task<SupplierDto?> UpdateAsync(int id, SupplierUpsertDto dto, CancellationToken cancellationToken = default)
    {
        var supplier = await dbContext.Suppliers.SingleOrDefaultAsync(supplier => supplier.Id == id, cancellationToken);
        if (supplier is null)
        {
            return null;
        }

        supplier.Name = dto.Name.Trim();
        supplier.Company = dto.Company.Trim();
        supplier.Email = dto.Email.Trim();
        supplier.Phone = dto.Phone.Trim();
        supplier.Address = dto.Address.Trim();
        supplier.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var supplier = await dbContext.Suppliers.SingleOrDefaultAsync(supplier => supplier.Id == id, cancellationToken);
        if (supplier is null)
        {
            return false;
        }

        dbContext.Suppliers.Remove(supplier);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
