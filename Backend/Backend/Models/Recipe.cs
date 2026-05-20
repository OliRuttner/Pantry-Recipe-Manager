namespace Backend.Models
{
    public class Recipe
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int CaloriesPerPortion { get; set; }
        public int BasePortions { get; set; }
        public DietType Diet { get; set; }
        public string Allergens { get; set; } = string.Empty;
        public string Instructions { get; set; } = string.Empty;

        // Navigation property for the junction
        public List<RecipeIngredient> Ingredients { get; set; } = new();

        public int CalculateMaxPortions(List<Item> inventory)
        {
            if (Ingredients == null || !Ingredients.Any()) return 0;

            int maxPortions = int.MaxValue;

            foreach (var ingredient in Ingredients)
            {
                var inventoryItem = inventory.FirstOrDefault(i => i.Id == ingredient.ItemId);
                if (inventoryItem == null || inventoryItem.Quantity == 0)
                {
                    return 0; // Missing ingredient
                }

                // Calculate how many base portions we can make with this ingredient
                int portionsWithThisIngredient = (int)(inventoryItem.Quantity / ingredient.RequiredQuantity) * BasePortions;

                if (portionsWithThisIngredient < maxPortions)
                {
                    maxPortions = portionsWithThisIngredient;
                }
            }

            return maxPortions == int.MaxValue ? 0 : maxPortions;
        }
    }
}
