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
public sealed class PurchasesController(IPurchaseService purchaseService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PurchaseListResponseDto>> GetAll(
        [FromQuery] string? search,
        [FromQuery, Range(1, 100)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest("Page must be at least 1 and pageSize must be between 1 and 100.");
        }

        var purchases = await purchaseService.GetAllAsync(search, page, pageSize, cancellationToken);
        return Ok(purchases);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PurchaseDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var purchase = await purchaseService.GetByIdAsync(id, cancellationToken);
        return purchase is null ? NotFound() : Ok(purchase);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PurchaseDto>> Create([FromBody] PurchaseUpsertDto dto, CancellationToken cancellationToken)
    {
        var result = await purchaseService.CreateAsync(dto, cancellationToken);
        return result.Status switch
        {
            PurchaseMutationStatus.Success => CreatedAtAction(nameof(GetById), new { id = result.Purchase!.Id }, result.Purchase),
            PurchaseMutationStatus.InvalidSupplier => BadRequest("The selected supplier does not exist."),
            PurchaseMutationStatus.InvalidProduct => BadRequest("The selected product does not exist."),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PurchaseDto>> Update(int id, [FromBody] PurchaseUpsertDto dto, CancellationToken cancellationToken)
    {
        var result = await purchaseService.UpdateAsync(id, dto, cancellationToken);
        return result.Status switch
        {
            PurchaseMutationStatus.Success => Ok(result.Purchase),
            PurchaseMutationStatus.NotFound => NotFound(),
            PurchaseMutationStatus.InvalidSupplier => BadRequest("The selected supplier does not exist."),
            PurchaseMutationStatus.InvalidProduct => BadRequest("The selected product does not exist."),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await purchaseService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
