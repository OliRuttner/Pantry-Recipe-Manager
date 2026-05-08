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
            // Logic to be implemented based on available inventory
            return 0;
        }
    }
}
