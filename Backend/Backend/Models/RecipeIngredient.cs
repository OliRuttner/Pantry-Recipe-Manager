namespace Backend.Models
{
    public class RecipeIngredient
    {
        public int RecipeId { get; set; }
        public Recipe? Recipe { get; set; }

        public int ItemId { get; set; }
        public Item? Item { get; set; }

        public double RequiredQuantity { get; set; }
    }
}
