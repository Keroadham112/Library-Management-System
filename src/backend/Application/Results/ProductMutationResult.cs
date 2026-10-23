using backend.Application.DTOs;

namespace backend.Application.Results;

public enum ProductMutationStatus
{
    Success,
    NotFound,
    InvalidCategory,
    Conflict
}

public sealed record ProductMutationResult(ProductMutationStatus Status, ProductDto? Product = null);
