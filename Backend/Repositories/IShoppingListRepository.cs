using Backend.Models;

namespace Backend.Repositories;

public interface IShoppingListRepository
{
    Task<List<ShoppingListItem>> GetAllAsync();
    Task<ShoppingListItem?> GetByIdAsync(int id);
    Task<List<ShoppingListItem>> GetBoughtItemsAsync();
    Task<List<Item>> GetItemsToRestockAsync();
    Task<Recipe?> GetRecipeWithIngredientsAsync(int recipeId);
    Task<Item?> GetPantryItemByIdAsync(int id);
    Task<Item?> GetPantryItemByNameAsync(string name);
    Task AddAsync(ShoppingListItem item);
    Task AddPantryItemAsync(Item item);
    void Delete(ShoppingListItem item);
    void DeleteRange(IEnumerable<ShoppingListItem> items);
    Task SaveAsync();
}