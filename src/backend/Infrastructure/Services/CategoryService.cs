using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Services;

public sealed class CategoryService(AppDbContext dbContext) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .Select(category => new CategoryDto
            {
                Id = category.Id,
                Name = category.Name
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<CategoryDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Categories
            .AsNoTracking()
            .Where(category => category.Id == id)
            .Select(category => new CategoryDto
            {
                Id = category.Id,
                Name = category.Name
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<CategoryDto> CreateAsync(CategoryUpsertDto dto, CancellationToken cancellationToken = default)
    {
        var category = new Category
        {
            Name = dto.Name.Trim()
        };

        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name
        };
    }

    public async Task<bool> UpdateAsync(int id, CategoryUpsertDto dto, CancellationToken cancellationToken = default)
    {
        var category = await dbContext.Categories
            .SingleOrDefaultAsync(category => category.Id == id, cancellationToken);

        if (category is null)
        {
            return false;
        }

        category.Name = dto.Name.Trim();
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await dbContext.Categories
            .SingleOrDefaultAsync(category => category.Id == id, cancellationToken);

        if (category is null)
        {
            return false;
        }

        dbContext.Categories.Remove(category);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
