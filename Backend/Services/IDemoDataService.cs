namespace Backend.Services
{
    public interface IDemoDataService
    {
        Task GenerateDemoDataAsync();
        Task ClearDemoDataAsync();
    }
}