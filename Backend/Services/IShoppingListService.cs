using Backend.DTOs;
using Backend.Models;

namespace Backend.Services;

public interface IShoppingListService
{
    Task<List<ShoppingListItem>> GetShoppingListAsync();
    Task<ShoppingListItem> AddItemManuallyAsync(ShoppingListItem item);
    Task<bool> DeleteShoppingListItemAsync(int id);
    Task<List<ShoppingListItem>> GenerateAutomaticRestockAsync();
    Task<List<ShoppingListItem>> GetMissingIngredientsAsync(int recipeId);
    Task<bool> ToggleBoughtStatusAsync(int id);
    Task ClearBoughtItemsAsync();
    Task<object> CheckoutItemAsync(CheckoutItemDto request);
    Task<object> BulkCheckoutItemsAsync(List<CheckoutItemDto> request);
    Task<object> CheckoutBoughtItemsAsync();
}