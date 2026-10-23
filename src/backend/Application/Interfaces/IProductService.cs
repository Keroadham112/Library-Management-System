using backend.Application.DTOs;
using backend.Application.Results;

namespace backend.Application.Interfaces;

public interface IProductService
{
    Task<ProductListResponseDto> GetAllAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default);

    Task<ProductDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<ProductMutationResult> CreateAsync(ProductUpsertDto dto, CancellationToken cancellationToken = default);

    Task<ProductMutationResult> UpdateAsync(int id, ProductUpsertDto dto, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
