using System.ComponentModel.DataAnnotations;
using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Application.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public sealed class SalesController(ISaleService saleService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SaleListResponseDto>> GetAll(
        [FromQuery] string? search,
        [FromQuery, Range(1, 100)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest("Page must be at least 1 and pageSize must be between 1 and 100.");
        }

        var sales = await saleService.GetAllAsync(search, page, pageSize, cancellationToken);
        return Ok(sales);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SaleDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var sale = await saleService.GetByIdAsync(id, cancellationToken);
        return sale is null ? NotFound() : Ok(sale);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SaleDto>> Create([FromBody] SaleUpsertDto dto, CancellationToken cancellationToken)
    {
        var result = await saleService.CreateAsync(dto, cancellationToken);
        return result.Status switch
        {
            SaleMutationStatus.Success => CreatedAtAction(nameof(GetById), new { id = result.Sale!.Id }, result.Sale),
            SaleMutationStatus.InvalidCustomer => BadRequest("The selected customer does not exist."),
            SaleMutationStatus.InvalidProduct => BadRequest("One or more selected products do not exist."),
            SaleMutationStatus.InvalidItems => BadRequest("At least one sale item is required."),
            SaleMutationStatus.InsufficientStock => BadRequest("Cannot complete sale because one or more products exceed available stock."),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SaleDto>> Update(int id, [FromBody] SaleUpsertDto dto, CancellationToken cancellationToken)
    {
        var result = await saleService.UpdateAsync(id, dto, cancellationToken);
        return result.Status switch
        {
            SaleMutationStatus.Success => Ok(result.Sale),
            SaleMutationStatus.NotFound => NotFound(),
            SaleMutationStatus.InvalidCustomer => BadRequest("The selected customer does not exist."),
            SaleMutationStatus.InvalidProduct => BadRequest("One or more selected products do not exist."),
            SaleMutationStatus.InvalidItems => BadRequest("At least one sale item is required."),
            SaleMutationStatus.InsufficientStock => BadRequest("Cannot complete sale because one or more products exceed available stock."),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await saleService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}