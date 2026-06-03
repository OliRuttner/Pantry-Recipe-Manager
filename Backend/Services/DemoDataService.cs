using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class DemoDataService : IDemoDataService
    {
        private readonly AppDbContext _context;

        public DemoDataService(AppDbContext context)
        {
            _context = context;
        }

        public async Task GenerateDemoDataAsync()
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                if (await _context.Items.AnyAsync() ||
                    await _context.Recipes.AnyAsync() ||
                    await _context.ShoppingListItems.AnyAsync())
                {
                    return;
                }

                var items = new List<Item>
                {
                    new Item { Name = "Rice", Quantity = 1.5, Unit = "kg", Category = "Grains", IsEssential = true, LowStockThreshold = 0.5 , ExpirationDate = DateTime.Today.AddDays(180) },
                    new Item { Name = "Pasta", Quantity = 1, Unit = "kg", Category = "Grains", IsEssential = true, LowStockThreshold = 0.4 , ExpirationDate = DateTime.Today.AddDays(160) },
                    new Item { Name = "Bread", Quantity = 1, Unit = "loaf", Category = "Bakery", IsEssential = true, LowStockThreshold = 1 , ExpirationDate = DateTime.Today.AddDays(2) },
                    new Item { Name = "Flour", Quantity = 1, Unit = "kg", Category = "Baking", IsEssential = false, LowStockThreshold = 0.3 , ExpirationDate = DateTime.Today.AddDays(120) },

                    new Item { Name = "Eggs", Quantity = 8, Unit = "pcs", Category = "Dairy", IsEssential = true, LowStockThreshold = 3 , ExpirationDate = DateTime.Today.AddDays(5) },
                    new Item { Name = "Milk", Quantity = 1.5, Unit = "L", Category = "Dairy", IsEssential = true, LowStockThreshold = 0.5 , ExpirationDate = DateTime.Today.AddDays(3) },
                    new Item { Name = "Cheese", Quantity = 300, Unit = "g", Category = "Dairy", IsEssential = false, LowStockThreshold = 100 , ExpirationDate = DateTime.Today.AddDays(10) },
                    new Item { Name = "Butter", Quantity = 200, Unit = "g", Category = "Dairy", IsEssential = false, LowStockThreshold = 50 , ExpirationDate = DateTime.Today.AddDays(35) },
                    new Item { Name = "Yogurt", Quantity = 2, Unit = "cups", Category = "Dairy", IsEssential = false, LowStockThreshold = 1 , ExpirationDate = DateTime.Today.AddDays(1) },

                    new Item { Name = "Chicken Breast", Quantity = 600, Unit = "g", Category = "Meat", IsEssential = false, LowStockThreshold = 200 , ExpirationDate = DateTime.Today.AddDays(2) },
                    new Item { Name = "Ham", Quantity = 200, Unit = "g", Category = "Meat", IsEssential = false, LowStockThreshold = 100 , ExpirationDate = DateTime.Today.AddDays(4) },
                    new Item { Name = "Tuna", Quantity = 2, Unit = "cans", Category = "Fish", IsEssential = false, LowStockThreshold = 1 , ExpirationDate = DateTime.Today.AddDays(365) },

                    new Item { Name = "Chickpeas", Quantity = 2, Unit = "cans", Category = "Other", IsEssential = false, LowStockThreshold = 1 , ExpirationDate = DateTime.Today.AddDays(300) },

                    new Item { Name = "Tomatoes", Quantity = 5, Unit = "pcs", Category = "Vegetables", IsEssential = false, LowStockThreshold = 2 , ExpirationDate = DateTime.Today.AddDays(2) },
                    new Item { Name = "Onion", Quantity = 4, Unit = "pcs", Category = "Vegetables", IsEssential = false, LowStockThreshold = 1 , ExpirationDate = DateTime.Today.AddDays(20) },
                    new Item { Name = "Garlic", Quantity = 5, Unit = "pcs", Category = "Vegetables", IsEssential = false, LowStockThreshold = 1 , ExpirationDate = DateTime.Today.AddDays(60) },
                    new Item { Name = "Potatoes", Quantity = 2, Unit = "kg", Category = "Vegetables", IsEssential = false, LowStockThreshold = 0.5 , ExpirationDate = DateTime.Today.AddDays(45) },
                    new Item { Name = "Carrots", Quantity = 6, Unit = "pcs", Category = "Vegetables", IsEssential = false, LowStockThreshold = 2 , ExpirationDate = DateTime.Today.AddDays(7) },
                    new Item { Name = "Lettuce", Quantity = 1, Unit = "pcs", Category = "Vegetables", IsEssential = false, LowStockThreshold = 1 , ExpirationDate = DateTime.Today.AddDays(1) },
                    new Item { Name = "Cucumber", Quantity = 2, Unit = "pcs", Category = "Vegetables", IsEssential = false, LowStockThreshold = 1 , ExpirationDate = DateTime.Today.AddDays(3) },
                    new Item { Name = "Mushrooms", Quantity = 250, Unit = "g", Category = "Vegetables", IsEssential = false, LowStockThreshold = 100 , ExpirationDate = DateTime.Today.AddDays(2) },
                    new Item { Name = "Bell Pepper", Quantity = 3, Unit = "pcs", Category = "Vegetables", IsEssential = false, LowStockThreshold = 1 , ExpirationDate = DateTime.Today.AddDays(4) },

                    new Item { Name = "Apples", Quantity = 5, Unit = "pcs", Category = "Fruits", IsEssential = false, LowStockThreshold = 2 , ExpirationDate = DateTime.Today.AddDays(14) },
                    new Item { Name = "Bananas", Quantity = 4, Unit = "pcs", Category = "Fruits", IsEssential = false, LowStockThreshold = 2 , ExpirationDate = DateTime.Today.AddDays(3) },

                    new Item { Name = "Olive Oil", Quantity = 1, Unit = "bottle", Category = "Other", IsEssential = true, LowStockThreshold = 1 , ExpirationDate = DateTime.Today.AddDays(365) },
                    new Item { Name = "Salt", Quantity = 1, Unit = "pack", Category = "Spices", IsEssential = true, LowStockThreshold = 1 , ExpirationDate = DateTime.Today.AddDays(730) },
                    new Item { Name = "Pepper", Quantity = 1, Unit = "jar", Category = "Spices", IsEssential = false, LowStockThreshold = 1 , ExpirationDate = DateTime.Today.AddDays(730) },
                    new Item { Name = "Oregano", Quantity = 1, Unit = "jar", Category = "Spices", IsEssential = false, LowStockThreshold = 1 , ExpirationDate = DateTime.Today.AddDays(730) },
                    new Item { Name = "Sugar", Quantity = 500, Unit = "g", Category = "Baking", IsEssential = false, LowStockThreshold = 100 , ExpirationDate = DateTime.Today.AddDays(365) },
                    new Item { Name = "Coffee", Quantity = 250, Unit = "g", Category = "Other", IsEssential = false, LowStockThreshold = 50 , ExpirationDate = DateTime.Today.AddDays(180) },
                    new Item { Name = "Chocolate", Quantity = 1, Unit = "bar", Category = "Snacks", IsEssential = false, LowStockThreshold = 1, ExpirationDate = DateTime.Today.AddDays(90) }
                };

                _context.Items.AddRange(items);
                await _context.SaveChangesAsync();

                Item FindItem(string name) => items.First(i => i.Name == name);

                var recipes = new List<Recipe>
                {
                    new Recipe { Name = "Cheese Omelette", CaloriesPerPortion = 380, BasePortions = 1, Diet = DietType.Vegetarian, Allergens = "Eggs, Dairy", Instructions = "Beat the eggs, add cheese, then cook everything in a pan." },
                    new Recipe { Name = "Tomato Pasta", CaloriesPerPortion = 520, BasePortions = 2, Diet = DietType.Vegetarian, Allergens = "Gluten", Instructions = "Boil pasta. Cook tomatoes with garlic and onion, then mix with pasta." },
                    new Recipe { Name = "Chicken Rice Bowl", CaloriesPerPortion = 650, BasePortions = 2, Diet = DietType.None, Allergens = "", Instructions = "Cook rice. Fry chicken with onion and bell pepper. Serve together." },
                    new Recipe { Name = "Tuna Sandwich", CaloriesPerPortion = 420, BasePortions = 1, Diet = DietType.None, Allergens = "Fish, Gluten", Instructions = "Put tuna, lettuce, and cucumber between two slices of bread." },
                    new Recipe { Name = "Grilled Cheese Sandwich", CaloriesPerPortion = 430, BasePortions = 1, Diet = DietType.Vegetarian, Allergens = "Dairy, Gluten", Instructions = "Add cheese between bread slices and toast with butter." },
                    new Recipe { Name = "Potato Carrot Soup", CaloriesPerPortion = 300, BasePortions = 3, Diet = DietType.Vegetarian, Allergens = "", Instructions = "Boil potatoes, carrots, and onion. Blend and season." },
                    new Recipe { Name = "Mushroom Pasta", CaloriesPerPortion = 560, BasePortions = 2, Diet = DietType.Vegetarian, Allergens = "Gluten, Dairy", Instructions = "Boil pasta. Cook mushrooms with butter and garlic, then mix." },
                    new Recipe { Name = "Chicken Salad", CaloriesPerPortion = 450, BasePortions = 2, Diet = DietType.None, Allergens = "", Instructions = "Cook chicken, then mix with lettuce, tomatoes, and cucumber." },
                    new Recipe { Name = "Pancakes", CaloriesPerPortion = 470, BasePortions = 3, Diet = DietType.Vegetarian, Allergens = "Eggs, Dairy, Gluten", Instructions = "Mix flour, milk, eggs, and sugar. Fry small pancakes." },
                    new Recipe { Name = "Ham and Cheese Toast", CaloriesPerPortion = 460, BasePortions = 1, Diet = DietType.None, Allergens = "Dairy, Gluten", Instructions = "Place ham and cheese between bread slices and toast." },
                    new Recipe { Name = "Simple Fried Rice", CaloriesPerPortion = 540, BasePortions = 2, Diet = DietType.Vegetarian, Allergens = "Eggs", Instructions = "Fry cooked rice with egg, onion, carrot, and pepper." },
                    new Recipe { Name = "Banana Yogurt Bowl", CaloriesPerPortion = 280, BasePortions = 1, Diet = DietType.Vegetarian, Allergens = "Dairy", Instructions = "Slice banana and mix with yogurt." },
                    new Recipe { Name = "Apple Pancakes", CaloriesPerPortion = 500, BasePortions = 3, Diet = DietType.Vegetarian, Allergens = "Eggs, Dairy, Gluten", Instructions = "Prepare pancake batter and add small apple pieces." },
                    new Recipe { Name = "Garlic Butter Potatoes", CaloriesPerPortion = 390, BasePortions = 2, Diet = DietType.Vegetarian, Allergens = "Dairy", Instructions = "Boil potatoes, then fry with butter and garlic." },
                    new Recipe { Name = "Tomato Cucumber Salad", CaloriesPerPortion = 180, BasePortions = 2, Diet = DietType.Vegetarian, Allergens = "", Instructions = "Cut tomatoes and cucumber, add olive oil, salt, and pepper." },

                    new Recipe { Name = "Vegan Chickpea Salad", CaloriesPerPortion = 330, BasePortions = 2, Diet = DietType.Vegan, Allergens = "", Instructions = "Mix chickpeas with tomatoes, cucumber, onion, olive oil, salt, and pepper." },
                    new Recipe { Name = "Vegan Rice Bowl", CaloriesPerPortion = 480, BasePortions = 2, Diet = DietType.Vegan, Allergens = "", Instructions = "Cook rice and serve with carrots, bell pepper, tomatoes, and olive oil." }
                };

                _context.Recipes.AddRange(recipes);
                await _context.SaveChangesAsync();

                Recipe FindRecipe(string name) => recipes.First(r => r.Name == name);

                var recipeIngredients = new List<RecipeIngredient>
                {
                    new RecipeIngredient { RecipeId = FindRecipe("Cheese Omelette").Id, ItemId = FindItem("Eggs").Id, RequiredQuantity = 2 },
                    new RecipeIngredient { RecipeId = FindRecipe("Cheese Omelette").Id, ItemId = FindItem("Cheese").Id, RequiredQuantity = 50 },
                    new RecipeIngredient { RecipeId = FindRecipe("Cheese Omelette").Id, ItemId = FindItem("Butter").Id, RequiredQuantity = 10 },

                    new RecipeIngredient { RecipeId = FindRecipe("Tomato Pasta").Id, ItemId = FindItem("Pasta").Id, RequiredQuantity = 250 },
                    new RecipeIngredient { RecipeId = FindRecipe("Tomato Pasta").Id, ItemId = FindItem("Tomatoes").Id, RequiredQuantity = 3 },
                    new RecipeIngredient { RecipeId = FindRecipe("Tomato Pasta").Id, ItemId = FindItem("Garlic").Id, RequiredQuantity = 1 },
                    new RecipeIngredient { RecipeId = FindRecipe("Tomato Pasta").Id, ItemId = FindItem("Onion").Id, RequiredQuantity = 1 },

                    new RecipeIngredient { RecipeId = FindRecipe("Chicken Rice Bowl").Id, ItemId = FindItem("Rice").Id, RequiredQuantity = 300 },
                    new RecipeIngredient { RecipeId = FindRecipe("Chicken Rice Bowl").Id, ItemId = FindItem("Chicken Breast").Id, RequiredQuantity = 300 },
                    new RecipeIngredient { RecipeId = FindRecipe("Chicken Rice Bowl").Id, ItemId = FindItem("Onion").Id, RequiredQuantity = 1 },
                    new RecipeIngredient { RecipeId = FindRecipe("Chicken Rice Bowl").Id, ItemId = FindItem("Bell Pepper").Id, RequiredQuantity = 1 },

                    new RecipeIngredient { RecipeId = FindRecipe("Tuna Sandwich").Id, ItemId = FindItem("Bread").Id, RequiredQuantity = 2 },
                    new RecipeIngredient { RecipeId = FindRecipe("Tuna Sandwich").Id, ItemId = FindItem("Tuna").Id, RequiredQuantity = 1 },
                    new RecipeIngredient { RecipeId = FindRecipe("Tuna Sandwich").Id, ItemId = FindItem("Lettuce").Id, RequiredQuantity = 1 },
                    new RecipeIngredient { RecipeId = FindRecipe("Tuna Sandwich").Id, ItemId = FindItem("Cucumber").Id, RequiredQuantity = 1 },

                    new RecipeIngredient { RecipeId = FindRecipe("Grilled Cheese Sandwich").Id, ItemId = FindItem("Bread").Id, RequiredQuantity = 2 },
                    new RecipeIngredient { RecipeId = FindRecipe("Grilled Cheese Sandwich").Id, ItemId = FindItem("Cheese").Id, RequiredQuantity = 80 },
                    new RecipeIngredient { RecipeId = FindRecipe("Grilled Cheese Sandwich").Id, ItemId = FindItem("Butter").Id, RequiredQuantity = 10 },

                    new RecipeIngredient { RecipeId = FindRecipe("Potato Carrot Soup").Id, ItemId = FindItem("Potatoes").Id, RequiredQuantity = 500 },
                    new RecipeIngredient { RecipeId = FindRecipe("Potato Carrot Soup").Id, ItemId = FindItem("Carrots").Id, RequiredQuantity = 3 },
                    new RecipeIngredient { RecipeId = FindRecipe("Potato Carrot Soup").Id, ItemId = FindItem("Onion").Id, RequiredQuantity = 1 },

                    new RecipeIngredient { RecipeId = FindRecipe("Mushroom Pasta").Id, ItemId = FindItem("Pasta").Id, RequiredQuantity = 250 },
                    new RecipeIngredient { RecipeId = FindRecipe("Mushroom Pasta").Id, ItemId = FindItem("Mushrooms").Id, RequiredQuantity = 150 },
                    new RecipeIngredient { RecipeId = FindRecipe("Mushroom Pasta").Id, ItemId = FindItem("Butter").Id, RequiredQuantity = 20 },
                    new RecipeIngredient { RecipeId = FindRecipe("Mushroom Pasta").Id, ItemId = FindItem("Garlic").Id, RequiredQuantity = 1 },

                    new RecipeIngredient { RecipeId = FindRecipe("Chicken Salad").Id, ItemId = FindItem("Chicken Breast").Id, RequiredQuantity = 250 },
                    new RecipeIngredient { RecipeId = FindRecipe("Chicken Salad").Id, ItemId = FindItem("Lettuce").Id, RequiredQuantity = 1 },
                    new RecipeIngredient { RecipeId = FindRecipe("Chicken Salad").Id, ItemId = FindItem("Tomatoes").Id, RequiredQuantity = 2 },
                    new RecipeIngredient { RecipeId = FindRecipe("Chicken Salad").Id, ItemId = FindItem("Cucumber").Id, RequiredQuantity = 1 },

                    new RecipeIngredient { RecipeId = FindRecipe("Pancakes").Id, ItemId = FindItem("Flour").Id, RequiredQuantity = 200 },
                    new RecipeIngredient { RecipeId = FindRecipe("Pancakes").Id, ItemId = FindItem("Milk").Id, RequiredQuantity = 300 },
                    new RecipeIngredient { RecipeId = FindRecipe("Pancakes").Id, ItemId = FindItem("Eggs").Id, RequiredQuantity = 2 },
                    new RecipeIngredient { RecipeId = FindRecipe("Pancakes").Id, ItemId = FindItem("Sugar").Id, RequiredQuantity = 30 },

                    new RecipeIngredient { RecipeId = FindRecipe("Ham and Cheese Toast").Id, ItemId = FindItem("Bread").Id, RequiredQuantity = 2 },
                    new RecipeIngredient { RecipeId = FindRecipe("Ham and Cheese Toast").Id, ItemId = FindItem("Ham").Id, RequiredQuantity = 80 },
                    new RecipeIngredient { RecipeId = FindRecipe("Ham and Cheese Toast").Id, ItemId = FindItem("Cheese").Id, RequiredQuantity = 60 },

                    new RecipeIngredient { RecipeId = FindRecipe("Simple Fried Rice").Id, ItemId = FindItem("Rice").Id, RequiredQuantity = 250 },
                    new RecipeIngredient { RecipeId = FindRecipe("Simple Fried Rice").Id, ItemId = FindItem("Eggs").Id, RequiredQuantity = 1 },
                    new RecipeIngredient { RecipeId = FindRecipe("Simple Fried Rice").Id, ItemId = FindItem("Carrots").Id, RequiredQuantity = 1 },
                    new RecipeIngredient { RecipeId = FindRecipe("Simple Fried Rice").Id, ItemId = FindItem("Onion").Id, RequiredQuantity = 1 },

                    new RecipeIngredient { RecipeId = FindRecipe("Banana Yogurt Bowl").Id, ItemId = FindItem("Bananas").Id, RequiredQuantity = 1 },
                    new RecipeIngredient { RecipeId = FindRecipe("Banana Yogurt Bowl").Id, ItemId = FindItem("Yogurt").Id, RequiredQuantity = 1 },

                    new RecipeIngredient { RecipeId = FindRecipe("Apple Pancakes").Id, ItemId = FindItem("Flour").Id, RequiredQuantity = 200 },
                    new RecipeIngredient { RecipeId = FindRecipe("Apple Pancakes").Id, ItemId = FindItem("Milk").Id, RequiredQuantity = 300 },
                    new RecipeIngredient { RecipeId = FindRecipe("Apple Pancakes").Id, ItemId = FindItem("Eggs").Id, RequiredQuantity = 2 },
                    new RecipeIngredient { RecipeId = FindRecipe("Apple Pancakes").Id, ItemId = FindItem("Apples").Id, RequiredQuantity = 2 },

                    new RecipeIngredient { RecipeId = FindRecipe("Garlic Butter Potatoes").Id, ItemId = FindItem("Potatoes").Id, RequiredQuantity = 500 },
                    new RecipeIngredient { RecipeId = FindRecipe("Garlic Butter Potatoes").Id, ItemId = FindItem("Garlic").Id, RequiredQuantity = 2 },
                    new RecipeIngredient { RecipeId = FindRecipe("Garlic Butter Potatoes").Id, ItemId = FindItem("Butter").Id, RequiredQuantity = 30 },

                    new RecipeIngredient { RecipeId = FindRecipe("Tomato Cucumber Salad").Id, ItemId = FindItem("Tomatoes").Id, RequiredQuantity = 3 },
                    new RecipeIngredient { RecipeId = FindRecipe("Tomato Cucumber Salad").Id, ItemId = FindItem("Cucumber").Id, RequiredQuantity = 1 },
                    new RecipeIngredient { RecipeId = FindRecipe("Tomato Cucumber Salad").Id, ItemId = FindItem("Olive Oil").Id, RequiredQuantity = 20 },

                    new RecipeIngredient { RecipeId = FindRecipe("Vegan Chickpea Salad").Id, ItemId = FindItem("Chickpeas").Id, RequiredQuantity = 1 },
                    new RecipeIngredient { RecipeId = FindRecipe("Vegan Chickpea Salad").Id, ItemId = FindItem("Tomatoes").Id, RequiredQuantity = 2 },
                    new RecipeIngredient { RecipeId = FindRecipe("Vegan Chickpea Salad").Id, ItemId = FindItem("Cucumber").Id, RequiredQuantity = 1 },
                    new RecipeIngredient { RecipeId = FindRecipe("Vegan Chickpea Salad").Id, ItemId = FindItem("Onion").Id, RequiredQuantity = 1 },
                    new RecipeIngredient { RecipeId = FindRecipe("Vegan Chickpea Salad").Id, ItemId = FindItem("Olive Oil").Id, RequiredQuantity = 20 },

                    new RecipeIngredient { RecipeId = FindRecipe("Vegan Rice Bowl").Id, ItemId = FindItem("Rice").Id, RequiredQuantity = 250 },
                    new RecipeIngredient { RecipeId = FindRecipe("Vegan Rice Bowl").Id, ItemId = FindItem("Carrots").Id, RequiredQuantity = 2 },
                    new RecipeIngredient { RecipeId = FindRecipe("Vegan Rice Bowl").Id, ItemId = FindItem("Bell Pepper").Id, RequiredQuantity = 1 },
                    new RecipeIngredient { RecipeId = FindRecipe("Vegan Rice Bowl").Id, ItemId = FindItem("Tomatoes").Id, RequiredQuantity = 2 },
                    new RecipeIngredient { RecipeId = FindRecipe("Vegan Rice Bowl").Id, ItemId = FindItem("Olive Oil").Id, RequiredQuantity = 20 }
                };

                _context.RecipeIngredients.AddRange(recipeIngredients);

                _context.ShoppingListItems.AddRange(
                    new ShoppingListItem { IngredientName = "Honey", QuantityNeeded = 1, Unit = "jar", IsBought = false },
                    new ShoppingListItem { IngredientName = "Lemon", QuantityNeeded = 3, Unit = "pcs", IsBought = false },
                    new ShoppingListItem { IngredientName = "Cream", QuantityNeeded = 200, Unit = "ml", IsBought = false }
                );

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task ClearDemoDataAsync()
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _context.RecipeIngredients.RemoveRange(_context.RecipeIngredients);
                _context.Recipes.RemoveRange(_context.Recipes);
                _context.ShoppingListItems.RemoveRange(_context.ShoppingListItems);
                _context.Items.RemoveRange(_context.Items);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
