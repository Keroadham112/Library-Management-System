using backend.Application.DTOs;

namespace backend.Application.Results;

public enum SaleMutationStatus
{
    Success,
    NotFound,
    InvalidCustomer,
    InvalidProduct,
    InvalidItems,
    InsufficientStock
}

public sealed record SaleMutationResult(
    SaleMutationStatus Status,
    SaleDto? Sale = null);