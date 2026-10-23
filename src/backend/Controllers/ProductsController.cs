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
public sealed class ProductsController(IProductService productService) : ControllerBase
{
    /// <summary>
    /// Gets products with optional name search and pagination.
    /// </summary>
    /// <param name="search">Optional product name filter.</param>
    /// <param name="page">The page number, starting at 1.</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <param name="cancellationToken">Cancels the request if the client disconnects.</param>
    /// <returns>A paged list of products including the category name.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProductListResponseDto>> GetAll(
        [FromQuery] string? search,
        [FromQuery, Range(1, 100)] int page = 1,
        [FromQuery, Range(1, 100)] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize < 1 || pageSize > 100)
        {
            return BadRequest("Page must be at least 1 and pageSize must be between 1 and 100.");
        }

        var products = await productService.GetAllAsync(search, page, pageSize, cancellationToken);
        return Ok(products);
    }

    /// <summary>
    /// Gets a product by its identifier.
    /// </summary>
    /// <param name="id">The product identifier.</param>
    /// <param name="cancellationToken">Cancels the request if the client disconnects.</param>
    /// <returns>The matching product or 404 if it does not exist.</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var product = await productService.GetByIdAsync(id, cancellationToken);
        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    /// <summary>
    /// Creates a new product.
    /// </summary>
    /// <param name="dto">The product data to create.</param>
    /// <param name="cancellationToken">Cancels the request if the client disconnects.</param>
    /// <returns>The created product, or an error if validation fails.</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ProductDto>> Create([FromBody] ProductUpsertDto dto, CancellationToken cancellationToken)
    {
        var result = await productService.CreateAsync(dto, cancellationToken);
        return result.Status switch
        {
            ProductMutationStatus.Success => CreatedAtAction(nameof(GetById), new { id = result.Product!.Id }, result.Product),
            ProductMutationStatus.InvalidCategory => BadRequest("The selected category does not exist."),
            ProductMutationStatus.Conflict => Conflict("SKU or barcode already exists."),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    /// <summary>
    /// Updates an existing product.
    /// </summary>
    /// <param name="id">The product identifier.</param>
    /// <param name="dto">The updated product data.</param>
    /// <param name="cancellationToken">Cancels the request if the client disconnects.</param>
    /// <returns>The updated product, or an error if the resource cannot be updated.</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ProductDto>> Update(int id, [FromBody] ProductUpsertDto dto, CancellationToken cancellationToken)
    {
        var result = await productService.UpdateAsync(id, dto, cancellationToken);
        return result.Status switch
        {
            ProductMutationStatus.Success => Ok(result.Product),
            ProductMutationStatus.NotFound => NotFound(),
            ProductMutationStatus.InvalidCategory => BadRequest("The selected category does not exist."),
            ProductMutationStatus.Conflict => Conflict("SKU or barcode already exists."),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    /// <summary>
    /// Deletes a product.
    /// </summary>
    /// <param name="id">The product identifier.</param>
    /// <param name="cancellationToken">Cancels the request if the client disconnects.</param>
    /// <returns>404 if the product does not exist, otherwise 204 No Content.</returns>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var deleted = await productService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
