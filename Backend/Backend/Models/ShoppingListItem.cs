namespace Backend.Models
{
    public class ShoppingListItem
    {
        public int Id { get; set; }
        public string IngredientName { get; set; } = string.Empty;
        public double QuantityNeeded { get; set; }
        public string Unit { get; set; } = string.Empty;
        public bool IsBought { get; set; }

        public void ToggleBoughtStatus() => IsBought = !IsBought;
    }
}
