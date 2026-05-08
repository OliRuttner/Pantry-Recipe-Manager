namespace Backend.Models
{
    public class Item
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public bool IsEssential { get; set; }
        public double LowStockThreshold { get; set; }

        // Logic methods from your UML
        public void UpdateQuantity(double amount) => Quantity += amount;
        public virtual string GetDetails() => $"{Name}: {Quantity} {Unit}";
        public bool IsStockLow() => Quantity <= LowStockThreshold;
    }
}
