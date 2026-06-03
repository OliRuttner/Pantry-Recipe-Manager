using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipesController : ControllerBase
    {
        private readonly IRecipeService _service;

        public RecipesController(IRecipeService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Recipe>>> GetRecipes()
        {
            return await _service.GetAllRecipesAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Recipe>> GetRecipeById(int id)
        {
            var recipe = await _service.GetRecipeByIdAsync(id);

            if (recipe == null)
                return NotFound();

            return recipe;
        }

        [HttpGet("search/{searchTerm}")]
        public async Task<ActionResult<IEnumerable<Recipe>>> SearchRecipes(string searchTerm)
        {
            var results = await _service.SearchRecipesAsync(searchTerm);

            if (!results.Any())
                return NotFound("No recipes found matching that name.");

            return Ok(results);
        }

        [HttpGet("searchByIngredient/{ingredientName}")]
        public async Task<ActionResult<IEnumerable<Recipe>>> SearchRecipesByIngredient(string ingredientName)
        {
            var results = await _service.SearchRecipesByIngredientAsync(ingredientName);

            if (!results.Any())
                return NotFound("No recipes found containing that ingredient.");

            return Ok(results);
        }

        [HttpGet("recommend")]
        public async Task<ActionResult<IEnumerable<object>>> RecommendRecipes()
        {
            var recommendations = await _service.RecommendRecipesAsync();

            if (!recommendations.Any())
                return NotFound("No recipes can be made with current inventory.");

            return Ok(recommendations);
        }

        [HttpPost]
        public async Task<ActionResult<Recipe>> PostRecipe(Recipe recipe)
        {
            try
            {
                var savedRecipe = await _service.CreateRecipeAsync(recipe);
                return CreatedAtAction(nameof(GetRecipeById), new { id = savedRecipe.Id }, savedRecipe);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRecipe(int id, Recipe recipe)
        {
            try
            {
                var success = await _service.UpdateRecipeAsync(id, recipe);

                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id}/cook")]
        public async Task<IActionResult> CookRecipe(int id, [FromBody] CookRecipeDto request)
        {
            try
            {
                var result = await _service.CookRecipeAsync(id, request.Portions);

                if ((bool)((dynamic)result).success == false)
                    return BadRequest(result);

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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecipe(int id)
        {
            var success = await _service.DeleteRecipeAsync(id);

            if (!success)
                return NotFound();

            return NoContent();
        }
    }
}