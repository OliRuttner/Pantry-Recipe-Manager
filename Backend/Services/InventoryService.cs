using Backend.Models;
using Backend.Repositories;

namespace Backend.Services;

public class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _repository;

    public InventoryService(IInventoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Item>> GetAllItemsAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Item?> GetItemByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Item> CreateItemAsync(Item item)
    {
        if (string.IsNullOrWhiteSpace(item.Name))
            throw new ArgumentException("Item name cannot be empty.");

        item.Name = item.Name.Trim();

        if (item.Quantity < 0)
            throw new ArgumentException("Quantity cannot be negative.");

        var existingItems = await _repository.GetAllAsync();
        bool duplicateExists = existingItems.Any(existing =>
            existing.Name.Trim().Equals(item.Name, StringComparison.OrdinalIgnoreCase)
        );

        if (duplicateExists)
            throw new ArgumentException("This ingredient already exists in the pantry.");

        await _repository.AddAsync(item);
        await _repository.SaveAsync();

        return item;
    }

    public async Task<bool> UpdateItemAsync(int id, Item item)
{
    if (id != item.Id)
        return false;

    if (string.IsNullOrWhiteSpace(item.Name))
        throw new ArgumentException("Item name cannot be empty.");

    item.Name = item.Name.Trim();

    if (item.Quantity < 0)
        throw new ArgumentException("Quantity cannot be negative.");

    var existingItems = await _repository.GetAllAsync();
    bool duplicateExists = existingItems.Any(existing =>
        existing.Id != id &&
        existing.Name.Trim().Equals(item.Name, StringComparison.OrdinalIgnoreCase)
    );

    if (duplicateExists)
        throw new ArgumentException("This ingredient already exists in the pantry.");

    _repository.Update(item);
    await _repository.SaveAsync();

    return true;
}

    public async Task<bool> DeleteItemAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);

        if (item == null)
            return false;

        _repository.Delete(item);
        await _repository.SaveAsync();

        return true;
    }
}