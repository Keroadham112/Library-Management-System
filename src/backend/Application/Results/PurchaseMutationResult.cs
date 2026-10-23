using backend.Application.DTOs;

namespace backend.Application.Results;

public enum PurchaseMutationStatus
{
    Success,
    NotFound,
    InvalidSupplier,
    InvalidProduct
}

public sealed record PurchaseMutationResult(
    PurchaseMutationStatus Status,
    PurchaseDto? Purchase = null);
