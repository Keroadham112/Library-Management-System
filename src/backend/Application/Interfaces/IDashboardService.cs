using backend.Application.DTOs;

namespace backend.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetSummaryAsync(CancellationToken cancellationToken = default);
}
