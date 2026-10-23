using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Services;

public sealed class CustomerService(AppDbContext dbContext) : ICustomerService
{
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    public async Task<CustomerListResponseDto> GetAllAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

        var query = dbContext.Customers
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim();
            query = query.Where(customer =>
                EF.Functions.Like(customer.Name, $"%{searchTerm}%") ||
                EF.Functions.Like(customer.Email, $"%{searchTerm}%") ||
                EF.Functions.Like(customer.Phone, $"%{searchTerm}%"));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);
        var items = await query
            .OrderBy(customer => customer.Name)
            .ThenBy(customer => customer.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(customer => new CustomerDto
            {
                Id = customer.Id,
                Name = customer.Name,
                Email = customer.Email,
                Phone = customer.Phone,
                Address = customer.Address,
                CreatedAt = customer.CreatedAt,
                UpdatedAt = customer.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return new CustomerListResponseDto
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    public async Task<CustomerDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Customers
            .AsNoTracking()
            .Where(customer => customer.Id == id)
            .Select(customer => new CustomerDto
            {
                Id = customer.Id,
                Name = customer.Name,
                Email = customer.Email,
                Phone = customer.Phone,
                Address = customer.Address,
                CreatedAt = customer.CreatedAt,
                UpdatedAt = customer.UpdatedAt
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<CustomerDto> CreateAsync(CustomerUpsertDto dto, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var customer = new Customer
        {
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim(),
            Phone = dto.Phone.Trim(),
            Address = dto.Address.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.Customers.Add(customer);
        await dbContext.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(customer.Id, cancellationToken))!;
    }

    public async Task<CustomerDto?> UpdateAsync(int id, CustomerUpsertDto dto, CancellationToken cancellationToken = default)
    {
        var customer = await dbContext.Customers.SingleOrDefaultAsync(customer => customer.Id == id, cancellationToken);
        if (customer is null)
        {
            return null;
        }

        customer.Name = dto.Name.Trim();
        customer.Email = dto.Email.Trim();
        customer.Phone = dto.Phone.Trim();
        customer.Address = dto.Address.Trim();
        customer.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var customer = await dbContext.Customers.SingleOrDefaultAsync(customer => customer.Id == id, cancellationToken);
        if (customer is null)
        {
            return false;
        }

        dbContext.Customers.Remove(customer);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
