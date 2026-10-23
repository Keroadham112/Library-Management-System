using backend.Application.DTOs;
using backend.Application.Results;

namespace backend.Application.Interfaces;

public interface ISaleService
{
    Task<SaleListResponseDto> GetAllAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default);

    Task<SaleDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<SaleMutationResult> CreateAsync(SaleUpsertDto dto, CancellationToken cancellationToken = default);

    Task<SaleMutationResult> UpdateAsync(int id, SaleUpsertDto dto, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}