using backend.Application.DTOs;

namespace backend.Application.Interfaces;

public interface ISupplierService
{
    Task<SupplierListResponseDto> GetAllAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default);

    Task<SupplierDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<SupplierDto> CreateAsync(SupplierUpsertDto dto, CancellationToken cancellationToken = default);

    Task<SupplierDto?> UpdateAsync(int id, SupplierUpsertDto dto, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
