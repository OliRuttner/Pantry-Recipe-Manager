using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class RecipeRepository : IRecipeRepository
{
    private readonly AppDbContext _context;

    public RecipeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Recipe>> GetAllAsync()
    {
        return await _context.Recipes
            .Include(r => r.Ingredients)
                .ThenInclude(ri => ri.Item)
            .ToListAsync();
    }

    public async Task<Recipe?> GetByIdAsync(int id)
    {
        return await _context.Recipes
            .Include(r => r.Ingredients)
                .ThenInclude(ri => ri.Item)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<List<Item>> GetAvailableInventoryAsync()
    {
        return await _context.Items
            .Where(i => i.Quantity > 0)
            .ToListAsync();
    }

    public async Task AddAsync(Recipe recipe)
    {
        await _context.Recipes.AddAsync(recipe);
    }

    public void Delete(Recipe recipe)
    {
        _context.Recipes.Remove(recipe);
    }

    public void RemoveIngredients(IEnumerable<RecipeIngredient> ingredients)
    {
        _context.RecipeIngredients.RemoveRange(ingredients);
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }
}