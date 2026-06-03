using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // These become your database tables
        public DbSet<Item> Items { get; set; }
        public DbSet<PerishableItem> PerishableItems { get; set; }
        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<RecipeIngredient> RecipeIngredients { get; set; }
        public DbSet<ShoppingListItem> ShoppingListItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 1. Configure the Many-to-Many junction table
            modelBuilder.Entity<RecipeIngredient>()
                .HasKey(ri => new { ri.RecipeId, ri.ItemId }); // Composite Key

            modelBuilder.Entity<RecipeIngredient>()
                .HasOne(ri => ri.Recipe)
                .WithMany(r => r.Ingredients)
                .HasForeignKey(ri => ri.RecipeId);

            modelBuilder.Entity<RecipeIngredient>()
                .HasOne(ri => ri.Item)
                .WithMany() // Items don't strictly need a list of recipes in your UML
                .HasForeignKey(ri => ri.ItemId);

            // 2. Configure Inheritance (Table-Per-Hierarchy)
            // This tells EF that PerishableItems are a type of Item
            modelBuilder.Entity<Item>()
                .HasDiscriminator<string>("ItemType")
                .HasValue<Item>("Standard")
                .HasValue<PerishableItem>("Perishable");

            base.OnModelCreating(modelBuilder);
        }
    }

}
