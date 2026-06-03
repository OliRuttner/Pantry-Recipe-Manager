using Backend.Models;

namespace Backend.Services;

public interface IRecipeService
{
    Task<List<Recipe>> GetAllRecipesAsync();
    Task<Recipe?> GetRecipeByIdAsync(int id);
    Task<List<Recipe>> SearchRecipesAsync(string searchTerm);
    Task<List<Recipe>> SearchRecipesByIngredientAsync(string ingredientName);
    Task<List<object>> RecommendRecipesAsync();
    Task<Recipe> CreateRecipeAsync(Recipe recipe);
    Task<bool> UpdateRecipeAsync(int id, Recipe recipe);
    Task<object> CookRecipeAsync(int id, int portions);
    Task<bool> DeleteRecipeAsync(int id);
}