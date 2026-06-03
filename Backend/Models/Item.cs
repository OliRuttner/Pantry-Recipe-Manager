namespace Backend.Models
{
    public class Item
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Quantity { get; set; }
        public string Unit { get; set; } = string.Empty;
        public string Category { get; set; } = "Other";
        public DateTime? ExpirationDate { get; set; }
        public bool IsEssential { get; set; }
        public double LowStockThreshold { get; set; }

        public void UpdateQuantity(double amount) => Quantity += amount;
        public virtual string GetDetails() => $"{Name}: {Quantity} {Unit}";
        public bool IsStockLow() => Quantity <= LowStockThreshold;
        public bool CheckIfExpired() => ExpirationDate.HasValue && DateTime.Now > ExpirationDate.Value;
    }
}