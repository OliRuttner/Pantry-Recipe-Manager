using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class ShoppingListRepository : IShoppingListRepository
{
    private readonly AppDbContext _context;

    public ShoppingListRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ShoppingListItem>> GetAllAsync()
    {
        return await _context.ShoppingListItems.ToListAsync();
    }

    public async Task<ShoppingListItem?> GetByIdAsync(int id)
    {
        return await _context.ShoppingListItems.FindAsync(id);
    }

    public async Task<List<ShoppingListItem>> GetBoughtItemsAsync()
    {
        return await _context.ShoppingListItems
            .Where(item => item.IsBought)
            .ToListAsync();
    }

    public async Task<List<Item>> GetItemsToRestockAsync()
    {
        return await _context.Items
            .Where(i => i.IsEssential && i.Quantity < i.LowStockThreshold)
            .ToListAsync();
    }

    public async Task<Recipe?> GetRecipeWithIngredientsAsync(int recipeId)
    {
        return await _context.Recipes
            .Include(r => r.Ingredients)
            .FirstOrDefaultAsync(r => r.Id == recipeId);
    }

    public async Task<Item?> GetPantryItemByIdAsync(int id)
    {
        return await _context.Items.FindAsync(id);
    }

    public async Task<Item?> GetPantryItemByNameAsync(string name)
    {
        return await _context.Items.FirstOrDefaultAsync(i => i.Name == name);
    }

    public async Task AddAsync(ShoppingListItem item)
    {
        await _context.ShoppingListItems.AddAsync(item);
    }

    public void Delete(ShoppingListItem item)
    {
        _context.ShoppingListItems.Remove(item);
    }

    public void DeleteRange(IEnumerable<ShoppingListItem> items)
    {
        _context.ShoppingListItems.RemoveRange(items);
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }
}