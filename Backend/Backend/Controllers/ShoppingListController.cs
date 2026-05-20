using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace PantryManager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckoutItemDto
    {
        public int ShoppingListItemId { get; set; }
        public double ActualQuantityBought { get; set; }
    }
    public class ShoppingListController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ShoppingListController(AppDbContext context)
        {
            _context = context;
        }

        // FEATURE 4: Delete a specific item from the shopping list
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShoppingListItem(int id)
        {
            // 1. Find the item in the database
            var item = await _context.ShoppingListItems.FindAsync(id);

            // 2. If it doesn't exist, return a 404
            if (item == null) return NotFound("Shopping list item not found.");

            // 3. Remove it and save changes
            _context.ShoppingListItems.Remove(item);
            await _context.SaveChangesAsync();

            // 4. Return 204 No Content (Standard REST practice for a successful delete)
            return NoContent();
        }

        // FEATURE 3: Add an item to the shopping list manually
        [HttpPost("manual-add")]
        public async Task<ActionResult<ShoppingListItem>> AddItemManually(ShoppingListItem item)
        {
            // Ensure it defaults to not bought when added
            item.IsBought = false;

            _context.ShoppingListItems.Add(item);
            await _context.SaveChangesAsync();

            // Standard REST return
            return CreatedAtAction(nameof(GetShoppingList), new { id = item.Id }, item);
        }

        // FEATURE 1: Generate Automatic Restock Inventory
        [HttpPost("generate-restock")]
        public async Task<ActionResult<IEnumerable<ShoppingListItem>>> GenerateAutomaticRestock()
        {
            // Find all essential items where current quantity is below the threshold
            var itemsToRestock = await _context.Items
                .Where(i => i.IsEssential && i.Quantity < i.LowStockThreshold)
                .ToListAsync();

            var newShoppingItems = new List<ShoppingListItem>();

            foreach (var item in itemsToRestock)
            {
                // Calculate how much to buy (e.g., top it up to double the threshold, or just a fixed amount)
                // For this example, let's just buy enough to get it 50 units above the threshold
                double amountToBuy = (item.LowStockThreshold - item.Quantity) + 50;

                var shoppingItem = new ShoppingListItem
                {
                    IngredientName = item.Name,
                    QuantityNeeded = amountToBuy,
                    Unit = item.Unit,
                    IsBought = false
                };

                newShoppingItems.Add(shoppingItem);
                _context.ShoppingListItems.Add(shoppingItem);
            }

            await _context.SaveChangesAsync();

            return Ok(newShoppingItems);
        }

        // FEATURE 2: Get Missing Ingredients for a Recipe
        [HttpPost("missing-ingredients/{recipeId}")]
        public async Task<ActionResult<IEnumerable<ShoppingListItem>>> GetMissingIngredients(int recipeId)
        {
            // Load the recipe with its required ingredients
            var recipe = await _context.Recipes
                .Include(r => r.Ingredients)
                .FirstOrDefaultAsync(r => r.Id == recipeId);

            if (recipe == null) return NotFound("Recipe not found.");

            var missingItems = new List<ShoppingListItem>();

            foreach (var recipeIngredient in recipe.Ingredients)
            {
                // Find the actual item in the pantry to check stock
                var pantryItem = await _context.Items.FindAsync(recipeIngredient.ItemId);

                if (pantryItem != null)
                {
                    // If we don't have enough, calculate the difference
                    if (pantryItem.Quantity < recipeIngredient.RequiredQuantity)
                    {
                        var deficit = recipeIngredient.RequiredQuantity - pantryItem.Quantity;

                        var shoppingItem = new ShoppingListItem
                        {
                            IngredientName = pantryItem.Name,
                            QuantityNeeded = deficit,
                            Unit = pantryItem.Unit,
                            IsBought = false
                        };

                        missingItems.Add(shoppingItem);
                        _context.ShoppingListItems.Add(shoppingItem);
                    }
                }
            }

            await _context.SaveChangesAsync();
            return Ok(missingItems);
        }

        // UTILITY: Toggle the Bought Status
        [HttpPatch("{id}/toggle-bought")]
        public async Task<IActionResult> ToggleBoughtStatus(int id)
        {
            var item = await _context.ShoppingListItems.FindAsync(id);
            if (item == null) return NotFound();

            item.ToggleBoughtStatus();
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // UTILITY: Get the current list
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShoppingListItem>>> GetShoppingList()
        {
            return await _context.ShoppingListItems.ToListAsync();
        }
        // UTILITY: Delete all items marked as "bought"
        [HttpDelete("clear-bought")]
        public async Task<IActionResult> ClearBoughtItems()
        {
            var boughtItems = await _context.ShoppingListItems
                .Where(item => item.IsBought == true)
                .ToListAsync();

            if (!boughtItems.Any()) return NoContent(); // Nothing to delete

            _context.ShoppingListItems.RemoveRange(boughtItems);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        // FEATURE 5: The "Checkout" Transaction
        [HttpPost("checkout")]
        public async Task<IActionResult> CheckoutItem([FromBody] CheckoutItemDto request)
        {
            // 1. Find the item on the shopping list
            var shoppingItem = await _context.ShoppingListItems.FindAsync(request.ShoppingListItemId);
            if (shoppingItem == null) return NotFound("Shopping list item not found.");

            // 2. Find the corresponding item in the main Pantry inventory.
            // Since ShoppingListItem stores the name as a string, we search the Items table by that Name.
            var pantryItem = await _context.Items.FirstOrDefaultAsync(i => i.Name == shoppingItem.IngredientName);

            if (pantryItem == null)
            {
                return BadRequest("Matching pantry item not found in inventory.");
            }

            // 3. Update the real pantry stock by the EXACT amount the user typed in
            pantryItem.Quantity += request.ActualQuantityBought;

            // 4. Delete the item from the shopping list since the transaction is complete
            _context.ShoppingListItems.Remove(shoppingItem);

            // 5. Save both changes to the database simultaneously 
            await _context.SaveChangesAsync();

            // Return a nice success message that the frontend can display in a toast notification
            return Ok(new
            {
                message = $"Successfully added {request.ActualQuantityBought} {pantryItem.Unit} of {pantryItem.Name} to the pantry!",
                newTotalQuantity = pantryItem.Quantity
            });
        }
        // FEATURE 6: Bulk Checkout Transaction
        [HttpPost("bulk-checkout")]
        public async Task<IActionResult> BulkCheckoutItems([FromBody] List<CheckoutItemDto> request)
        {
            if (request == null || !request.Any())
            {
                return BadRequest("No items provided for checkout.");
            }

            var successfulItems = new List<string>();

            // 1. Loop through the array sent by the frontend
            foreach (var dto in request)
            {
                // Find the shopping list item
                var shoppingItem = await _context.ShoppingListItems.FindAsync(dto.ShoppingListItemId);
                if (shoppingItem == null) continue; // Skip if it doesn't exist

                // Find the matching pantry inventory item
                var pantryItem = await _context.Items.FirstOrDefaultAsync(i => i.Name == shoppingItem.IngredientName);

                if (pantryItem != null)
                {
                    // Update the real pantry stock
                    pantryItem.Quantity += dto.ActualQuantityBought;
                    successfulItems.Add(pantryItem.Name);
                }

                // Remove it from the shopping list
                _context.ShoppingListItems.Remove(shoppingItem);
            }

            // 2. Save ALL changes to the database in one massive transaction
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Successfully checked out {successfulItems.Count} items!",
                itemsUpdated = successfulItems
            });
        }
    }
}