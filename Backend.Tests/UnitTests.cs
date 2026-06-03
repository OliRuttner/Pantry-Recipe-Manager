using Backend.Models;
using Xunit;

namespace Backend.Tests;

public class UnitTests
{
    [Fact]
    public void Item_UpdateQuantity_ShouldAddAmount()
    {
        var item = new Item { Quantity = 5 };

        item.UpdateQuantity(3);

        Assert.Equal(8, item.Quantity);
    }

    [Fact]
    public void Item_UpdateQuantity_ShouldSubtractAmount()
    {
        var item = new Item { Quantity = 10 };

        item.UpdateQuantity(-4);

        Assert.Equal(6, item.Quantity);
    }

    [Fact]
    public void Item_GetDetails_ShouldReturnCorrectText()
    {
        var item = new Item { Name = "Milk", Quantity = 1, Unit = "L" };

        var result = item.GetDetails();

        Assert.Equal("Milk: 1 L", result);
    }

    [Fact]
    public void Item_IsStockLow_ShouldReturnTrue_WhenQuantityEqualsThreshold()
    {
        var item = new Item { Quantity = 3, LowStockThreshold = 3 };

        Assert.True(item.IsStockLow());
    }

    [Fact]
    public void Item_IsStockLow_ShouldReturnTrue_WhenQuantityBelowThreshold()
    {
        var item = new Item { Quantity = 2, LowStockThreshold = 3 };

        Assert.True(item.IsStockLow());
    }

    [Fact]
    public void Item_IsStockLow_ShouldReturnFalse_WhenQuantityAboveThreshold()
    {
        var item = new Item { Quantity = 5, LowStockThreshold = 3 };

        Assert.False(item.IsStockLow());
    }

    [Fact]
    public void Item_CheckIfExpired_ShouldReturnTrue_WhenDateIsPast()
    {
        var item = new Item { ExpirationDate = DateTime.Now.AddDays(-1) };

        Assert.True(item.CheckIfExpired());
    }

    [Fact]
    public void Item_CheckIfExpired_ShouldReturnFalse_WhenDateIsFuture()
    {
        var item = new Item { ExpirationDate = DateTime.Now.AddDays(2) };

        Assert.False(item.CheckIfExpired());
    }

    [Fact]
    public void Item_CheckIfExpired_ShouldReturnFalse_WhenNoExpirationDate()
    {
        var item = new Item { ExpirationDate = null };

        Assert.False(item.CheckIfExpired());
    }

    [Fact]
    public void Item_DefaultCategory_ShouldBeOther()
    {
        var item = new Item();

        Assert.Equal("Other", item.Category);
    }

    [Fact]
    public void Item_DefaultName_ShouldBeEmpty()
    {
        var item = new Item();

        Assert.Equal(string.Empty, item.Name);
    }

    [Fact]
    public void Item_DefaultUnit_ShouldBeEmpty()
    {
        var item = new Item();

        Assert.Equal(string.Empty, item.Unit);
    }

    [Fact]
    public void PerishableItem_GetDetails_ShouldIncludeExpirationDate()
    {
        var date = new DateTime(2026, 6, 5);
        var item = new PerishableItem
        {
            Name = "Yogurt",
            Quantity = 2,
            Unit = "pcs",
            ExpirationDate = date
        };

        var result = item.GetDetails();

        Assert.Contains("Yogurt: 2 pcs", result);
        Assert.Contains("Expires:", result);
    }

    [Fact]
    public void PerishableItem_GetDetails_ShouldNotIncludeExpiration_WhenDateMissing()
    {
        var item = new PerishableItem
        {
            Name = "Rice",
            Quantity = 1,
            Unit = "kg",
            ExpirationDate = null
        };

        var result = item.GetDetails();

        Assert.Equal("Rice: 1 kg", result);
    }

    [Fact]
    public void ShoppingListItem_ToggleBoughtStatus_ShouldChangeFalseToTrue()
    {
        var item = new ShoppingListItem { IsBought = false };

        item.ToggleBoughtStatus();

        Assert.True(item.IsBought);
    }

    [Fact]
    public void ShoppingListItem_ToggleBoughtStatus_ShouldChangeTrueToFalse()
    {
        var item = new ShoppingListItem { IsBought = true };

        item.ToggleBoughtStatus();

        Assert.False(item.IsBought);
    }

    [Fact]
    public void ShoppingListItem_DefaultIngredientName_ShouldBeEmpty()
    {
        var item = new ShoppingListItem();

        Assert.Equal(string.Empty, item.IngredientName);
    }

    [Fact]
    public void ShoppingListItem_DefaultUnit_ShouldBeEmpty()
    {
        var item = new ShoppingListItem();

        Assert.Equal(string.Empty, item.Unit);
    }

    [Fact]
    public void Recipe_CalculateMaxPortions_ShouldReturn0_WhenNoIngredients()
    {
        var recipe = new Recipe
        {
            BasePortions = 2,
            Ingredients = new List<RecipeIngredient>()
        };

        var inventory = new List<Item>();

        var result = recipe.CalculateMaxPortions(inventory);

        Assert.Equal(0, result);
    }

    [Fact]
    public void Recipe_CalculateMaxPortions_ShouldReturn0_WhenIngredientIsMissing()
    {
        var recipe = new Recipe
        {
            BasePortions = 2,
            Ingredients = new List<RecipeIngredient>
            {
                new RecipeIngredient { ItemId = 1, RequiredQuantity = 100 }
            }
        };

        var inventory = new List<Item>();

        var result = recipe.CalculateMaxPortions(inventory);

        Assert.Equal(0, result);
    }

    [Fact]
    public void Recipe_CalculateMaxPortions_ShouldReturn0_WhenInventoryQuantityIsZero()
    {
        var recipe = new Recipe
        {
            BasePortions = 2,
            Ingredients = new List<RecipeIngredient>
            {
                new RecipeIngredient { ItemId = 1, RequiredQuantity = 100 }
            }
        };

        var inventory = new List<Item>
        {
            new Item { Id = 1, Quantity = 0 }
        };

        var result = recipe.CalculateMaxPortions(inventory);

        Assert.Equal(0, result);
    }

    [Fact]
    public void Recipe_CalculateMaxPortions_ShouldReturnBasePortions_WhenEnoughForOneRecipe()
    {
        var recipe = new Recipe
        {
            BasePortions = 2,
            Ingredients = new List<RecipeIngredient>
            {
                new RecipeIngredient { ItemId = 1, RequiredQuantity = 100 }
            }
        };

        var inventory = new List<Item>
        {
            new Item { Id = 1, Quantity = 100 }
        };

        var result = recipe.CalculateMaxPortions(inventory);

        Assert.Equal(2, result);
    }

    [Fact]
    public void Recipe_CalculateMaxPortions_ShouldReturnDoubleBasePortions_WhenEnoughForTwoRecipes()
    {
        var recipe = new Recipe
        {
            BasePortions = 2,
            Ingredients = new List<RecipeIngredient>
            {
                new RecipeIngredient { ItemId = 1, RequiredQuantity = 100 }
            }
        };

        var inventory = new List<Item>
        {
            new Item { Id = 1, Quantity = 200 }
        };

        var result = recipe.CalculateMaxPortions(inventory);

        Assert.Equal(4, result);
    }

    [Fact]
    public void Recipe_CalculateMaxPortions_ShouldUseSmallestIngredientAmount()
    {
        var recipe = new Recipe
        {
            BasePortions = 2,
            Ingredients = new List<RecipeIngredient>
            {
                new RecipeIngredient { ItemId = 1, RequiredQuantity = 100 },
                new RecipeIngredient { ItemId = 2, RequiredQuantity = 50 }
            }
        };

        var inventory = new List<Item>
        {
            new Item { Id = 1, Quantity = 300 },
            new Item { Id = 2, Quantity = 50 }
        };

        var result = recipe.CalculateMaxPortions(inventory);

        Assert.Equal(2, result);
    }

    [Fact]
    public void Recipe_CalculateMaxPortions_ShouldIgnoreExtraInventoryItems()
    {
        var recipe = new Recipe
        {
            BasePortions = 1,
            Ingredients = new List<RecipeIngredient>
            {
                new RecipeIngredient { ItemId = 1, RequiredQuantity = 2 }
            }
        };

        var inventory = new List<Item>
        {
            new Item { Id = 1, Quantity = 4 },
            new Item { Id = 99, Quantity = 1000 }
        };

        var result = recipe.CalculateMaxPortions(inventory);

        Assert.Equal(2, result);
    }

    [Fact]
    public void Recipe_CalculateMaxPortions_ShouldReturn0_WhenQuantityLessThanRequired()
    {
        var recipe = new Recipe
        {
            BasePortions = 2,
            Ingredients = new List<RecipeIngredient>
            {
                new RecipeIngredient { ItemId = 1, RequiredQuantity = 100 }
            }
        };

        var inventory = new List<Item>
        {
            new Item { Id = 1, Quantity = 50 }
        };

        var result = recipe.CalculateMaxPortions(inventory);

        Assert.Equal(0, result);
    }

    [Fact]
    public void Recipe_DefaultName_ShouldBeEmpty()
    {
        var recipe = new Recipe();

        Assert.Equal(string.Empty, recipe.Name);
    }

    [Fact]
    public void Recipe_DefaultAllergens_ShouldBeEmpty()
    {
        var recipe = new Recipe();

        Assert.Equal(string.Empty, recipe.Allergens);
    }

    [Fact]
    public void Recipe_DefaultInstructions_ShouldBeEmpty()
    {
        var recipe = new Recipe();

        Assert.Equal(string.Empty, recipe.Instructions);
    }

    [Fact]
    public void Recipe_DefaultIngredients_ShouldNotBeNull()
    {
        var recipe = new Recipe();

        Assert.NotNull(recipe.Ingredients);
    }
}