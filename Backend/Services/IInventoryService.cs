using Backend.Models;

namespace Backend.Services;

public interface IInventoryService
{
    Task<List<Item>> GetAllItemsAsync();
    Task<Item?> GetItemByIdAsync(int id);
    Task<Item> CreateItemAsync(Item item);
    Task<bool> UpdateItemAsync(int id, Item item);
    Task<bool> DeleteItemAsync(int id);
}