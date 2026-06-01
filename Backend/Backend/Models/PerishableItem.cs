namespace Backend.Models
{
    public class PerishableItem : Item
    {
        public override string GetDetails() =>
            ExpirationDate.HasValue
                ? $"{base.GetDetails()} (Expires: {ExpirationDate.Value.ToShortDateString()})"
                : base.GetDetails();
    }
}