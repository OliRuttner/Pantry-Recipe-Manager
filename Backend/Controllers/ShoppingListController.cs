using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShoppingListController : ControllerBase
    {
        private readonly IShoppingListService _service;

        public ShoppingListController(IShoppingListService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShoppingListItem>>> GetShoppingList()
        {
            return await _service.GetShoppingListAsync();
        }

        [HttpPost("manual-add")]
        public async Task<ActionResult<ShoppingListItem>> AddItemManually(ShoppingListItem item)
        {
            try
            {
                var createdItem = await _service.AddItemManuallyAsync(item);
                return CreatedAtAction(nameof(GetShoppingList), new { id = createdItem.Id }, createdItem);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("generate-restock")]
        public async Task<ActionResult<IEnumerable<ShoppingListItem>>> GenerateAutomaticRestock()
        {
            var items = await _service.GenerateAutomaticRestockAsync();
            return Ok(items);
        }

        [HttpPost("missing-ingredients/{recipeId}")]
        public async Task<ActionResult<IEnumerable<ShoppingListItem>>> GetMissingIngredients(int recipeId)
        {
            try
            {
                var missingItems = await _service.GetMissingIngredientsAsync(recipeId);
                return Ok(missingItems);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPatch("{id}/toggle-bought")]
        public async Task<IActionResult> ToggleBoughtStatus(int id)
        {
            var success = await _service.ToggleBoughtStatusAsync(id);

            if (!success)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShoppingListItem(int id)
        {
            var success = await _service.DeleteShoppingListItemAsync(id);

            if (!success)
                return NotFound("Shopping list item not found.");

            return NoContent();
        }

        [HttpDelete("clear-bought")]
        public async Task<IActionResult> ClearBoughtItems()
        {
            await _service.ClearBoughtItemsAsync();
            return NoContent();
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> CheckoutItem([FromBody] CheckoutItemDto request)
        {
            try
            {
                var result = await _service.CheckoutItemAsync(request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost("checkout-bought")]
        public async Task<IActionResult> CheckoutBoughtItems()
        {
            try
            {
                var result = await _service.CheckoutBoughtItemsAsync();
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("bulk-checkout")]
        public async Task<IActionResult> BulkCheckoutItems([FromBody] List<CheckoutItemDto> request)
        {
            try
            {
                var result = await _service.BulkCheckoutItemsAsync(request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}