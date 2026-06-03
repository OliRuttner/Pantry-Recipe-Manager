using Backend.Models;

namespace Backend.Repositories;

public interface IInventoryRepository
{
    Task<List<Item>> GetAllAsync();
    Task<Item?> GetByIdAsync(int id);
    Task AddAsync(Item item);
    void Update(Item item);
    void Delete(Item item);
    Task SaveAsync();
}