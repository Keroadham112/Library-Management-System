using backend.Application.DTOs;
using backend.Application.Results;

namespace backend.Application.Interfaces;

public interface IPurchaseService
{
    Task<PurchaseListResponseDto> GetAllAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default);

    Task<PurchaseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<PurchaseMutationResult> CreateAsync(PurchaseUpsertDto dto, CancellationToken cancellationToken = default);

    Task<PurchaseMutationResult> UpdateAsync(int id, PurchaseUpsertDto dto, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
