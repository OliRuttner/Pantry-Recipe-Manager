using Backend.Models;
using Backend.Repositories;
using System.Text.RegularExpressions;

namespace Backend.Services;

public class RecipeService : IRecipeService
{
    private readonly IRecipeRepository _repository;

    public RecipeService(IRecipeRepository repository)
    {
        _repository = repository;
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
                recommendations.Add(new
                {
                    Recipe = recipe,
                    MaxPortions = maxPortions
                });
            }
        }

        return recommendations
            .OrderByDescending(r => (int)((dynamic)r).MaxPortions)
            .ToList();
    }

    public async Task<Recipe> CreateRecipeAsync(Recipe recipe)
    {
        ValidateRecipe(recipe);

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

        var existingRecipe = await _repository.GetByIdAsync(id);

        if (existingRecipe == null)
            return false;

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

        await _repository.SaveAsync();

        return true;
    }

    public async Task<object> CookRecipeAsync(int id, int portions)
    {
        if (portions <= 0)
            throw new ArgumentException("Portions must be greater than 0.");

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

        await _repository.SaveAsync();

        return new
        {
            success = true,
            message = "Recipe cooked successfully."
        };
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

    private void ValidateRecipe(Recipe recipe)
    {
        if (string.IsNullOrWhiteSpace(recipe.Name))
            throw new ArgumentException("Recipe name cannot be empty.");

        if (recipe.BasePortions <= 0)
            throw new ArgumentException("Base portions must be greater than 0.");

        if (recipe.CaloriesPerPortion < 0)
            throw new ArgumentException("Calories cannot be negative.");

        foreach (var ingredient in recipe.Ingredients)
        {
            if (ingredient.RequiredQuantity <= 0)
                throw new ArgumentException("Ingredient quantity must be greater than 0.");
        }
    }
}