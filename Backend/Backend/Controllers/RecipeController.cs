using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using System.Text.RegularExpressions;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RecipesController(AppDbContext context)
        {
            _context = context;
        }

        // 1. READ ALL (Including Ingredients)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Recipe>>> GetRecipes()
        {
            // We use .Include to tell EF to fetch the linked ingredients from the junction table
            var recipes = await _context.Recipes
                .Include(r => r.Ingredients)
                    .ThenInclude(ri => ri.Item) // <-- This is the magic line
                .ToListAsync();

            return recipes;
        }

        // 2. READ by name
        [HttpGet("search/{searchTerm}")]
        public async Task<ActionResult<IEnumerable<Recipe>>> SearchRecipes(string searchTerm)
        {
            // 1. Define the Regex pattern to find all punctuation
            // \p{P} matches any punctuation character
            string punctuationPattern = @"\p{P}";

            // 2. Clean the Search Term: Remove punctuation and make it lowercase
            string cleanedSearch = Regex.Replace(searchTerm, punctuationPattern, "").ToLower().Trim();

            // 3. Fetch recipes from the DB
            // Note: We fetch the list first because SQL can't do the Regex part
            var allRecipes = await _context.Recipes
                .Include(r => r.Ingredients)
                .ToListAsync();

            // 4. Filter the list in memory using the same Regex logic
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
            // Fetch inventory items with >0 quantity
            var inventory = await _context.Items.Where(i => i.Quantity > 0).ToListAsync();

            var allRecipes = await _context.Recipes
                .Include(r => r.Ingredients)
                .ToListAsync();

            var recommendations = new List<object>();

            foreach(var recipe in allRecipes)
            {
                int maxPortions = recipe.CalculateMaxPortions(inventory);
                if (maxPortions > 0)
                {
                    recommendations.Add(new { Recipe = recipe, MaxPortions = maxPortions });
                }
            }

            // Order by max portions descending to recommend the ones we can make the most of
            recommendations = recommendations.OrderByDescending(r => (int)((dynamic)r).MaxPortions).ToList();

            if (!recommendations.Any()) return NotFound("No recipes can be made with current inventory.");

            return Ok(recommendations);
        }

        // 3. CREATE
        [HttpPost]
        public async Task<ActionResult<Recipe>> PostRecipe(Recipe recipe)
        {
            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            // Now we point to the method that actually takes an ID
            return CreatedAtAction(nameof(GetRecipeById), new { id = recipe.Id }, recipe);
        }

        // 4. UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRecipe(int id, Recipe recipe)
        {
            if (id != recipe.Id) return BadRequest();

            _context.Entry(recipe).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Recipes.Any(e => e.Id == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }
        // This provides a direct path to one recipe: api/Recipes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Recipe>> GetRecipeById(int id)
        {
            var recipe = await _context.Recipes
                .Include(r => r.Ingredients)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recipe == null) return NotFound();

            return recipe;
        }

        // 5. DELETE
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