using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using System.Text.RegularExpressions;

namespace Backend.Controllers
{
    public class CookRecipeDto
    {
        public int Portions { get; set; } = 1;
    }

    [Route("api/[controller]")]
    [ApiController]
    public class RecipesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RecipesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Recipe>>> GetRecipes()
        {
            return await _context.Recipes
                .Include(r => r.Ingredients)
                    .ThenInclude(ri => ri.Item)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Recipe>> GetRecipeById(int id)
        {
            var recipe = await _context.Recipes
                .Include(r => r.Ingredients)
                    .ThenInclude(ri => ri.Item)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recipe == null) return NotFound();

            return recipe;
        }

        [HttpGet("search/{searchTerm}")]
        public async Task<ActionResult<IEnumerable<Recipe>>> SearchRecipes(string searchTerm)
        {
            string punctuationPattern = @"\p{P}";
            string cleanedSearch = Regex.Replace(searchTerm, punctuationPattern, "").ToLower().Trim();

            var allRecipes = await _context.Recipes
                .Include(r => r.Ingredients)
                    .ThenInclude(ri => ri.Item)
                .ToListAsync();

            var results = allRecipes.Where(r =>
                Regex.Replace(r.Name, punctuationPattern, "").ToLower().Contains(cleanedSearch)
            ).ToList();

            if (!results.Any()) return NotFound("No recipes found matching that name.");

            return Ok(results);
        }

        [HttpGet("searchByIngredient/{ingredientName}")]
        public async Task<ActionResult<IEnumerable<Recipe>>> SearchRecipesByIngredient(string ingredientName)
        {
            string punctuationPattern = @"\p{P}";
            string cleanedSearch = Regex.Replace(ingredientName, punctuationPattern, "").ToLower().Trim();

            var allRecipes = await _context.Recipes
                .Include(r => r.Ingredients)
                    .ThenInclude(ri => ri.Item)
                .ToListAsync();

            var results = allRecipes.Where(r => r.Ingredients.Any(ri =>
                ri.Item != null && Regex.Replace(ri.Item.Name, punctuationPattern, "").ToLower().Contains(cleanedSearch)
            )).ToList();

            if (!results.Any()) return NotFound("No recipes found containing that ingredient.");

            return Ok(results);
        }

        [HttpGet("recommend")]
        public async Task<ActionResult<IEnumerable<object>>> RecommendRecipes()
        {
            var inventory = await _context.Items.Where(i => i.Quantity > 0).ToListAsync();

            var allRecipes = await _context.Recipes
                .Include(r => r.Ingredients)
                    .ThenInclude(ri => ri.Item)
                .ToListAsync();

            var recommendations = new List<object>();

            foreach (var recipe in allRecipes)
            {
                int maxPortions = recipe.CalculateMaxPortions(inventory);

                if (maxPortions > 0)
                {
                    recommendations.Add(new { Recipe = recipe, MaxPortions = maxPortions });
                }
            }

            recommendations = recommendations
                .OrderByDescending(r => (int)((dynamic)r).MaxPortions)
                .ToList();

            if (!recommendations.Any()) return NotFound("No recipes can be made with current inventory.");

            return Ok(recommendations);
        }

        [HttpPost]
        public async Task<ActionResult<Recipe>> PostRecipe(Recipe recipe)
        {
            foreach (var ingredient in recipe.Ingredients)
            {
                ingredient.Recipe = null;
                ingredient.Item = null;
            }

            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            var savedRecipe = await _context.Recipes
                .Include(r => r.Ingredients)
                    .ThenInclude(ri => ri.Item)
                .FirstAsync(r => r.Id == recipe.Id);

            return CreatedAtAction(nameof(GetRecipeById), new { id = recipe.Id }, savedRecipe);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRecipe(int id, Recipe recipe)
        {
            if (id != recipe.Id) return BadRequest();

            var existingRecipe = await _context.Recipes
                .Include(r => r.Ingredients)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (existingRecipe == null) return NotFound();

            existingRecipe.Name = recipe.Name;
            existingRecipe.CaloriesPerPortion = recipe.CaloriesPerPortion;
            existingRecipe.BasePortions = recipe.BasePortions;
            existingRecipe.Diet = recipe.Diet;
            existingRecipe.Allergens = recipe.Allergens;
            existingRecipe.Instructions = recipe.Instructions;

            _context.RecipeIngredients.RemoveRange(existingRecipe.Ingredients);

            existingRecipe.Ingredients = recipe.Ingredients.Select(ingredient => new RecipeIngredient
            {
                RecipeId = id,
                ItemId = ingredient.ItemId,
                RequiredQuantity = ingredient.RequiredQuantity
            }).ToList();

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/cook")]
        public async Task<IActionResult> CookRecipe(int id, [FromBody] CookRecipeDto request)
        {
            if (request.Portions <= 0) return BadRequest("Portions must be greater than 0.");

            var recipe = await _context.Recipes
                .Include(r => r.Ingredients)
                    .ThenInclude(ri => ri.Item)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recipe == null) return NotFound("Recipe not found.");

            double multiplier = (double)request.Portions / recipe.BasePortions;
            var missingIngredients = new List<object>();

            foreach (var ingredient in recipe.Ingredients)
            {
                if (ingredient.Item == null) continue;

                double neededQuantity = ingredient.RequiredQuantity * multiplier;

                if (ingredient.Item.Quantity < neededQuantity)
                {
                    missingIngredients.Add(new
                    {
                        ingredientName = ingredient.Item.Name,
                        quantityNeeded = Math.Round(neededQuantity - ingredient.Item.Quantity, 2),
                        unit = ingredient.Item.Unit
                    });
                }
            }

            if (missingIngredients.Any())
            {
                return BadRequest(new
                {
                    message = "Not enough ingredients to cook this recipe.",
                    missingIngredients
                });
            }

            foreach (var ingredient in recipe.Ingredients)
            {
                if (ingredient.Item == null) continue;

                double neededQuantity = ingredient.RequiredQuantity * multiplier;
                ingredient.Item.Quantity = Math.Round(ingredient.Item.Quantity - neededQuantity, 2);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Recipe cooked successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecipe(int id)
        {
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null) return NotFound();

            _context.Recipes.Remove(recipe);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}