using Backend.Models;

namespace Backend.Repositories;

public interface IRecipeRepository
{
    Task<List<Recipe>> GetAllAsync();
    Task<Recipe?> GetByIdAsync(int id);
    Task<List<Item>> GetAvailableInventoryAsync();
    Task AddAsync(Recipe recipe);
    void Delete(Recipe recipe);
    void RemoveIngredients(IEnumerable<RecipeIngredient> ingredients);
    Task SaveAsync();
}