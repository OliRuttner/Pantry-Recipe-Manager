using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Services;

public class ShoppingListService : IShoppingListService
{
    private readonly IShoppingListRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public ShoppingListService(IShoppingListRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<ShoppingListItem>> GetShoppingListAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<ShoppingListItem> AddItemManuallyAsync(ShoppingListItem item)
    {
        ValidateShoppingListItem(item);

        item.IngredientName = item.IngredientName.Trim();
        item.IsBought = false;

        var existingItems = await _repository.GetAllAsync();
        bool duplicateExists = existingItems.Any(existing =>
            existing.IngredientName.Trim().Equals(item.IngredientName, StringComparison.OrdinalIgnoreCase) &&
            existing.Unit.Trim().Equals(item.Unit.Trim(), StringComparison.OrdinalIgnoreCase)
        );

        if (duplicateExists)
            throw new ArgumentException("This ingredient already exists in the shopping list.");

        await _repository.AddAsync(item);
        await _repository.SaveAsync();

        return item;
    }

    public async Task<bool> DeleteShoppingListItemAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);

        if (item == null)
            return false;

        _repository.Delete(item);
        await _repository.SaveAsync();

        return true;
    }

    public async Task<List<ShoppingListItem>> GenerateAutomaticRestockAsync()
    {
        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        try
        {
            var itemsToRestock = await _repository.GetItemsToRestockAsync();
            var newShoppingItems = new List<ShoppingListItem>();

            foreach (var item in itemsToRestock)
            {
                double amountToBuy = (item.LowStockThreshold - item.Quantity) + 50;

                var shoppingItem = new ShoppingListItem
                {
                    IngredientName = item.Name,
                    QuantityNeeded = amountToBuy,
                    Unit = item.Unit,
                    IsBought = false
                };

                newShoppingItems.Add(shoppingItem);
                await _repository.AddAsync(shoppingItem);
            }

            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            return newShoppingItems;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<List<ShoppingListItem>> GetMissingIngredientsAsync(int recipeId)
    {
        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        try
        {
            var recipe = await _repository.GetRecipeWithIngredientsAsync(recipeId);

            if (recipe == null)
                throw new KeyNotFoundException("Recipe not found.");

            var missingItems = new List<ShoppingListItem>();

            foreach (var recipeIngredient in recipe.Ingredients)
            {
                var pantryItem = await _repository.GetPantryItemByIdAsync(recipeIngredient.ItemId);

                if (pantryItem == null)
                    continue;

                if (pantryItem.Quantity < recipeIngredient.RequiredQuantity)
                {
                    double deficit = recipeIngredient.RequiredQuantity - pantryItem.Quantity;

                    var shoppingItem = new ShoppingListItem
                    {
                        IngredientName = pantryItem.Name,
                        QuantityNeeded = deficit,
                        Unit = pantryItem.Unit,
                        IsBought = false
                    };

                    missingItems.Add(shoppingItem);
                    await _repository.AddAsync(shoppingItem);
                }
            }

            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            return missingItems;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> ToggleBoughtStatusAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);

        if (item == null)
            return false;

        item.ToggleBoughtStatus();
        await _repository.SaveAsync();

        return true;
    }

    public async Task ClearBoughtItemsAsync()
    {
        var boughtItems = await _repository.GetBoughtItemsAsync();

        if (boughtItems.Any())
        {
            _repository.DeleteRange(boughtItems);
            await _repository.SaveAsync();
        }
    }

    public async Task<object> CheckoutItemAsync(CheckoutItemDto request)
    {
        if (request.ActualQuantityBought <= 0)
            throw new ArgumentException("Quantity bought must be greater than 0.");

        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        try
        {
            var shoppingItem = await _repository.GetByIdAsync(request.ShoppingListItemId);

            if (shoppingItem == null)
                throw new KeyNotFoundException("Shopping list item not found.");

            var pantryItem = await _repository.GetPantryItemByNameAsync(shoppingItem.IngredientName);

            if (pantryItem == null)
            {
                pantryItem = new Item
                {
                    Name = shoppingItem.IngredientName,
                    Quantity = request.ActualQuantityBought,
                    Unit = shoppingItem.Unit,
                    Category = "Other",
                    ExpirationDate = null,
                    IsEssential = false,
                    LowStockThreshold = 0
                };

                await _repository.AddPantryItemAsync(pantryItem);
            }
            else
            {
                pantryItem.Quantity += request.ActualQuantityBought;
            }

            _repository.Delete(shoppingItem);
            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            return new
            {
                message = $"Successfully added {request.ActualQuantityBought} {pantryItem.Unit} of {pantryItem.Name} to the pantry!",
                newTotalQuantity = pantryItem.Quantity
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<object> BulkCheckoutItemsAsync(List<CheckoutItemDto> request)
    {
        if (request == null || !request.Any())
            throw new ArgumentException("No items provided for checkout.");

        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        try
        {
            var successfulItems = new List<string>();

            foreach (var dto in request)
            {
                if (dto.ActualQuantityBought <= 0)
                    continue;

                var shoppingItem = await _repository.GetByIdAsync(dto.ShoppingListItemId);

                if (shoppingItem == null)
                    continue;

                var pantryItem = await _repository.GetPantryItemByNameAsync(shoppingItem.IngredientName);

                if (pantryItem == null)
                {
                    pantryItem = new Item
                    {
                        Name = shoppingItem.IngredientName,
                        Quantity = dto.ActualQuantityBought,
                        Unit = shoppingItem.Unit,
                        Category = "Other",
                        ExpirationDate = null,
                        IsEssential = false,
                        LowStockThreshold = 0
                    };

                    await _repository.AddPantryItemAsync(pantryItem);
                }
                else
                {
                    pantryItem.Quantity += dto.ActualQuantityBought;
                }

                successfulItems.Add(pantryItem.Name);
                _repository.Delete(shoppingItem);
            }

            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            return new
            {
                message = $"Successfully checked out {successfulItems.Count} items!",
                itemsUpdated = successfulItems
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<object> CheckoutBoughtItemsAsync()
    {
        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        try
        {
            var boughtItems = await _repository.GetBoughtItemsAsync();

            if (!boughtItems.Any())
                throw new ArgumentException("No bought items selected.");

            var successfulItems = new List<string>();

            foreach (var shoppingItem in boughtItems)
            {
                if (shoppingItem.QuantityNeeded <= 0)
                    continue;

                var ingredientName = shoppingItem.IngredientName.Trim();
                var pantryItem = await _repository.GetPantryItemByNameAsync(ingredientName);

                if (pantryItem == null)
                {
                    pantryItem = new Item
                    {
                        Name = ingredientName,
                        Quantity = shoppingItem.QuantityNeeded,
                        Unit = shoppingItem.Unit,
                        Category = "Other",
                        ExpirationDate = null,
                        IsEssential = false,
                        LowStockThreshold = 0
                    };

                    await _repository.AddPantryItemAsync(pantryItem);
                }
                else
                {
                    pantryItem.Quantity += shoppingItem.QuantityNeeded;
                }

                successfulItems.Add(pantryItem.Name);
                _repository.Delete(shoppingItem);
            }

            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            return new
            {
                message = $"Successfully added {successfulItems.Count} bought items to the pantry.",
                itemsUpdated = successfulItems
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private void ValidateShoppingListItem(ShoppingListItem item)
    {
        if (string.IsNullOrWhiteSpace(item.IngredientName))
            throw new ArgumentException("Ingredient name cannot be empty.");

        if (item.QuantityNeeded <= 0)
            throw new ArgumentException("Quantity needed must be greater than 0.");

        if (string.IsNullOrWhiteSpace(item.Unit))
            throw new ArgumentException("Unit cannot be empty.");
    }
}