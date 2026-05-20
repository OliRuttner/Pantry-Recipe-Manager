namespace Backend.Models
{
    public class PerishableItem : Item
    {
        public DateTime ExpirationDate { get; set; }

        public bool CheckIfExpired() => DateTime.Now > ExpirationDate;

        public override string GetDetails() =>
            $"{base.GetDetails()} (Expires: {ExpirationDate.ToShortDateString()})";
    }
}
