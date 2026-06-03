using Backend.Data;
using Backend.Models;
using Backend.Repositories;
using System.Text.RegularExpressions;

namespace Backend.Services;

public class RecipeService : IRecipeService
{
    private readonly IRecipeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public RecipeService(IRecipeRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<Recipe>> GetAllRecipesAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Recipe?> GetRecipeByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<List<Recipe>> SearchRecipesAsync(string searchTerm)
    {
        string punctuationPattern = @"\p{P}";
        string cleanedSearch = Regex.Replace(searchTerm, punctuationPattern, "").ToLower().Trim();

        var allRecipes = await _repository.GetAllAsync();

        return allRecipes.Where(r =>
            Regex.Replace(r.Name, punctuationPattern, "").ToLower().Contains(cleanedSearch)
        ).ToList();
    }

    public async Task<List<Recipe>> SearchRecipesByIngredientAsync(string ingredientName)
    {
        string punctuationPattern = @"\p{P}";
        string cleanedSearch = Regex.Replace(ingredientName, punctuationPattern, "").ToLower().Trim();

        var allRecipes = await _repository.GetAllAsync();

        return allRecipes.Where(r => r.Ingredients.Any(ri =>
            ri.Item != null &&
            Regex.Replace(ri.Item.Name, punctuationPattern, "").ToLower().Contains(cleanedSearch)
        )).ToList();
    }

    public async Task<List<object>> RecommendRecipesAsync()
    {
        var inventory = await _repository.GetAvailableInventoryAsync();
        var allRecipes = await _repository.GetAllAsync();

        var recommendations = new List<object>();

        foreach (var recipe in allRecipes)
        {
            int maxPortions = recipe.CalculateMaxPortions(inventory);

            if (maxPortions > 0)
            {
                var expiringIngredients = recipe.Ingredients
                    .Where(ingredient => ingredient.Item?.ExpirationDate != null)
                    .Select(ingredient => new
                    {
                        ingredient.Item!.Name,
                        ingredient.Item.ExpirationDate,
                        DaysLeft = (ingredient.Item.ExpirationDate!.Value.Date - DateTime.Today).Days
                    })
                    .Where(ingredient => ingredient.DaysLeft >= 0 && ingredient.DaysLeft <= 3)
                    .OrderBy(ingredient => ingredient.DaysLeft)
                    .ToList();

                int expiryPriority = expiringIngredients.Sum(ingredient => Math.Max(1, 4 - ingredient.DaysLeft));

                recommendations.Add(new
                {
                    Recipe = recipe,
                    MaxPortions = maxPortions,
                    ExpiringIngredients = expiringIngredients,
                    ExpiryPriority = expiryPriority
                });
            }
        }

        return recommendations
            .OrderByDescending(r => (int)((dynamic)r).ExpiryPriority)
            .ThenByDescending(r => (int)((dynamic)r).MaxPortions)
            .ToList();
    }

    public async Task<Recipe> CreateRecipeAsync(Recipe recipe)
    {
        ValidateRecipe(recipe);
        await ValidateRecipeNameIsUniqueAsync(recipe.Name, null);

        foreach (var ingredient in recipe.Ingredients)
        {
            ingredient.Recipe = null;
            ingredient.Item = null;
        }

        await _repository.AddAsync(recipe);
        await _repository.SaveAsync();

        var savedRecipe = await _repository.GetByIdAsync(recipe.Id);

        return savedRecipe!;
    }

    public async Task<bool> UpdateRecipeAsync(int id, Recipe recipe)
    {
        if (id != recipe.Id)
            return false;

        ValidateRecipe(recipe);
        await ValidateRecipeNameIsUniqueAsync(recipe.Name, id);

        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        try
        {
            var existingRecipe = await _repository.GetByIdAsync(id);

            if (existingRecipe == null)
            {
                await transaction.RollbackAsync();
                return false;
            }

            existingRecipe.Name = recipe.Name;
            existingRecipe.CaloriesPerPortion = recipe.CaloriesPerPortion;
            existingRecipe.BasePortions = recipe.BasePortions;
            existingRecipe.Diet = recipe.Diet;
            existingRecipe.Allergens = recipe.Allergens;
            existingRecipe.Instructions = recipe.Instructions;

            _repository.RemoveIngredients(existingRecipe.Ingredients);

            existingRecipe.Ingredients = recipe.Ingredients.Select(ingredient => new RecipeIngredient
            {
                RecipeId = id,
                ItemId = ingredient.ItemId,
                RequiredQuantity = ingredient.RequiredQuantity
            }).ToList();

            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<object> CookRecipeAsync(int id, int portions)
    {
        if (portions <= 0)
            throw new ArgumentException("Portions must be greater than 0.");

        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        try
        {
            var recipe = await _repository.GetByIdAsync(id);

            if (recipe == null)
                throw new KeyNotFoundException("Recipe not found.");

            if (recipe.BasePortions <= 0)
                throw new ArgumentException("Recipe base portions must be greater than 0.");

            double multiplier = (double)portions / recipe.BasePortions;
            var missingIngredients = new List<object>();

            foreach (var ingredient in recipe.Ingredients)
            {
                if (ingredient.Item == null)
                    continue;

                double neededQuantity = ingredient.RequiredQuantity * multiplier;

                if (ingredient.Item.Quantity < neededQuantity)
                {
                    missingIngredients.Add(new
                    {
                        ingredientName = ingredient.Item.Name,
                        quantityNeeded = Math.Round(neededQuantity - ingredient.Item.Quantity, 2),
                        unit = ingredient.Item.Unit
                    });
                }
            }

            if (missingIngredients.Any())
            {
                await transaction.RollbackAsync();

                return new
                {
                    success = false,
                    message = "Not enough ingredients to cook this recipe.",
                    missingIngredients
                };
            }

            foreach (var ingredient in recipe.Ingredients)
            {
                if (ingredient.Item == null)
                    continue;

                double neededQuantity = ingredient.RequiredQuantity * multiplier;
                ingredient.Item.Quantity = Math.Round(ingredient.Item.Quantity - neededQuantity, 2);
            }

            await _unitOfWork.SaveChangesAsync();
            await transaction.CommitAsync();

            return new
            {
                success = true,
                message = "Recipe cooked successfully."
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> DeleteRecipeAsync(int id)
    {
        var recipe = await _repository.GetByIdAsync(id);

        if (recipe == null)
            return false;

        _repository.Delete(recipe);
        await _repository.SaveAsync();

        return true;
    }

    private async Task ValidateRecipeNameIsUniqueAsync(string name, int? currentRecipeId)
    {
        var recipes = await _repository.GetAllAsync();
        bool duplicateExists = recipes.Any(existing =>
            (!currentRecipeId.HasValue || existing.Id != currentRecipeId.Value) &&
            existing.Name.Trim().Equals(name.Trim(), StringComparison.OrdinalIgnoreCase)
        );

        if (duplicateExists)
            throw new ArgumentException("This recipe already exists.");
    }

    private void ValidateRecipe(Recipe recipe)
    {
        if (string.IsNullOrWhiteSpace(recipe.Name))
            throw new ArgumentException("Recipe name cannot be empty.");

        recipe.Name = recipe.Name.Trim();

        if (recipe.BasePortions <= 0)
            throw new ArgumentException("Base portions must be greater than 0.");

        if (recipe.CaloriesPerPortion < 0)
            throw new ArgumentException("Calories cannot be negative.");

        var duplicateIngredientIds = recipe.Ingredients
            .GroupBy(ingredient => ingredient.ItemId)
            .Any(group => group.Key > 0 && group.Count() > 1);

        if (duplicateIngredientIds)
            throw new ArgumentException("A recipe cannot contain the same ingredient more than once.");

        foreach (var ingredient in recipe.Ingredients)
        {
            if (ingredient.RequiredQuantity <= 0)
                throw new ArgumentException("Ingredient quantity must be greater than 0.");
        }
    }
}