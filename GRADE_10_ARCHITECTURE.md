# Pantry Recipe Manager - Grade 10 Architecture Proof

## Project overview
Pantry Recipe Manager is a full-stack pantry and recipe management application. Users can manage pantry ingredients, create recipes, see recipe recommendations based on available ingredients, cook recipes by automatically decreasing ingredient quantities, generate shopping lists, and check out bought shopping-list items into the pantry.

## Rubric mapping

### Grade 7 - Basic Application
- Backend developed in C# using ASP.NET Core / .NET 8.
- Graphical user interface developed with React.
- The UI contains multiple pages: Pantry, Recipes, Recipe Details, Recipe Suggestions, and Shopping List.
- The UI uses inputs, buttons, select boxes, lists, tables, forms, modal dialogs, and checkboxes.
- The backend uses OOP models such as `Item`, `PerishableItem`, `Recipe`, `RecipeIngredient`, and `ShoppingListItem`.

### Grade 8 - Application with Database
- SQL Server LocalDB is integrated through Entity Framework Core.
- The application has more than 3 database tables: `Items`, `Recipes`, `RecipeIngredients`, and `ShoppingListItems`.
- CRUD operations are implemented for pantry items, recipes, and shopping-list items.
- Search and filtering are implemented for pantry items and recipes.

### Grade 9 - Complex Application
- Database management is implemented using Entity Framework Core migrations.
- Relationships between tables are configured in `AppDbContext`:
  - `Recipe` has many `RecipeIngredient` records.
  - `RecipeIngredient` connects `Recipe` and `Item`.
  - `Item` and `PerishableItem` use EF Core inheritance with a discriminator.
- Transactions are implemented using the Unit of Work pattern and EF Core transactions in operations that update multiple records:
  - `RecipeService.CookRecipeAsync`
  - `RecipeService.UpdateRecipeAsync`
  - `ShoppingListService.CheckoutItemAsync`
  - `ShoppingListService.BulkCheckoutItemsAsync`
  - `ShoppingListService.GenerateAutomaticRestockAsync`
  - `ShoppingListService.GetMissingIngredientsAsync`
- Validation and business logic are implemented in the backend service layer, not directly in the controllers.

### Grade 10 - Advanced Application / Software Architecture
The project uses a multitier architecture:

1. **Presentation layer**
   - React frontend in `Frontend/pantry-manager`.
   - Responsible for displaying pages, forms, navigation, and user interactions.

2. **API / Controller layer**
   - ASP.NET Core controllers in `Backend/Controllers`.
   - Responsible for receiving HTTP requests and returning HTTP responses.

3. **Business logic layer**
   - Services in `Backend/Services`.
   - Responsible for validation, rules, calculations, recommendations, cooking recipes, checkout logic, and restocking logic.

4. **Data access layer**
   - Repositories in `Backend/Repositories`.
   - `AppDbContext`, migrations, and SQL Server database configuration in `Backend/Data`.

## Design patterns used

### Repository Pattern
Used in:
- `IInventoryRepository` / `InventoryRepository`
- `IRecipeRepository` / `RecipeRepository`
- `IShoppingListRepository` / `ShoppingListRepository`

Purpose: separates data access code from business logic.

### Service Layer Pattern
Used in:
- `IInventoryService` / `InventoryService`
- `IRecipeService` / `RecipeService`
- `IShoppingListService` / `ShoppingListService`

Purpose: keeps business rules away from controllers and repositories.

### Unit of Work Pattern
Used in:
- `IUnitOfWork`
- `UnitOfWork`

Purpose: groups multiple database changes into one transaction, so an operation either fully succeeds or fully rolls back.

## SOLID principles

### Single Responsibility Principle
Controllers handle HTTP requests, services handle business rules, repositories handle database operations, and models represent domain entities.

### Open/Closed Principle
The repository and service interfaces allow the application to be extended or replaced without rewriting controllers.

### Liskov Substitution Principle
`PerishableItem` extends `Item` and can be treated as an `Item` while adding expiration-specific behavior.

### Interface Segregation Principle
Separate interfaces exist for different responsibilities: inventory, recipes, shopping list, and unit of work.

### Dependency Inversion Principle
Controllers depend on service interfaces, and services depend on repository / unit-of-work interfaces instead of concrete classes.

## Why this is Grade 10-ready
The project satisfies the Grade 9 database and transaction requirements and also clearly demonstrates Grade 10 architecture through layered design, SOLID principles, Repository Pattern, Service Layer Pattern, and Unit of Work Pattern.
