using backend.Application.DTOs;

namespace backend.Application.Interfaces;

public interface ICustomerService
{
    Task<CustomerListResponseDto> GetAllAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default);

    Task<CustomerDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<CustomerDto> CreateAsync(CustomerUpsertDto dto, CancellationToken cancellationToken = default);

    Task<CustomerDto?> UpdateAsync(int id, CustomerUpsertDto dto, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
