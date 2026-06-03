import { useEffect, useState } from "react";
import Layout from "./components/Layout.jsx";
import PantryPage from "./pages/PantryPage.jsx";
import RecipesPage from "./pages/RecipesPage.jsx";
import SuggestionsPage from "./pages/SuggestionsPage.jsx";
import ShoppingListPage from "./pages/ShoppingListPage.jsx";
import RecipeDetailPage from "./pages/RecipeDetailPage.jsx";
import { api } from "./services/api.js";
import { getMissingIngredients } from "./utils/pantryLogic.js";

export default function App() {
  const [page, setPage] = useState("pantry");
  const [pantry, setPantry] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAllData() {
    setError("");

    try {
      const [inventoryData, recipeData, shoppingData] = await Promise.all([
        api.getInventory(),
        api.getRecipes(),
        api.getShoppingList(),
      ]);

      setPantry(inventoryData);
      setRecipes(recipeData);
      setShoppingList(shoppingData);

      setSelectedItemId((currentId) =>
        currentId && inventoryData.some((item) => item.id === currentId)
          ? currentId
          : inventoryData[0]?.id ?? null
      );

      setSelectedRecipeId((currentId) =>
        currentId && recipeData.some((recipe) => recipe.id === currentId)
          ? currentId
          : recipeData[0]?.id ?? null
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPantry() {
    const inventoryData = await api.getInventory();
    setPantry(inventoryData);
  }

  async function loadRecipes() {
    const recipeData = await api.getRecipes();
    setRecipes(recipeData);
  }

  async function loadShoppingList() {
    const shoppingData = await api.getShoppingList();
    setShoppingList(shoppingData);
  }

  useEffect(() => {
    loadAllData();
  }, []);

  const selectedRecipe =
    recipes.find((recipe) => recipe.id === selectedRecipeId) || recipes[0];

  async function saveItem(item) {
    setError("");

    try {
      if (item.id) {
        await api.updateInventoryItem(item);
        await loadPantry();
        setSelectedItemId(item.id);
      } else {
        const createdItem = await api.createInventoryItem(item);
        await loadPantry();
        setSelectedItemId(createdItem.id);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteItem(id) {
    if (!id) return;
    setError("");

    try {
      await api.deleteInventoryItem(id);
      await loadPantry();
      setSelectedItemId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveRecipe(recipe) {
    setError("");

    try {
      if (recipe.id) {
        await api.updateRecipe(recipe, pantry);
        await loadRecipes();
        setSelectedRecipeId(recipe.id);
      } else {
        const createdRecipe = await api.createRecipe(recipe, pantry);
        await loadAllData();
        setSelectedRecipeId(createdRecipe.id);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteRecipe(id) {
    if (!id) return;
    setError("");

    try {
      await api.deleteRecipe(id);
      await loadRecipes();
      setSelectedRecipeId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addMissingToShopping(missingItems) {
    setError("");

    try {
      await Promise.all(missingItems.map((item) => api.addShoppingItem(item)));
      await loadShoppingList();
      setPage("shopping");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function addShoppingItem(item) {
    setError("");

    try {
      await api.addShoppingItem(item);
      await loadShoppingList();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function cookRecipe(recipeId, portions, options = {}) {
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe) return;

    const missing = getMissingIngredients(recipe, pantry, portions);

    if (missing.length > 0) {
      await addMissingToShopping(missing);
      return { success: false, redirectedToShopping: true };
    }

    setError("");

    try {
      const result = await api.cookRecipe(recipeId, portions);
      await loadPantry();

      if (options.redirect !== false) {
        setPage("pantry");
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function toggleBought(id) {
    setError("");

    try {
      await api.toggleShoppingItem(id);
      await loadShoppingList();
    } catch (err) {
      setError(err.message);
    }
  }

  async function clearBought() {
    setError("");

    try {
      await api.clearBoughtShoppingItems();
      await loadShoppingList();
    } catch (err) {
      setError(err.message);
    }
  }

  async function checkoutBought() {
    const boughtItems = shoppingList.filter((item) => item.isBought);

    if (boughtItems.length === 0) return;

    setError("");

    try {
      await api.checkoutBoughtShoppingItems();
      await loadAllData();
      setPage("pantry");
    } catch (err) {
      setError(err.message);
    }
  }

  async function clearAllShopping() {
    setError("");

    try {
      await Promise.all(shoppingList.map((item) => api.deleteShoppingItem(item.id)));
      await loadShoppingList();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout page={page} setPage={setPage}>
      {loading && (
        <section className="page-card">
          <h1>Loading pantry data...</h1>
        </section>
      )}

      {!loading && error && <div className="empty-box">API error: {error}</div>}

      {!loading && page === "pantry" && (
        <PantryPage
          pantry={pantry}
          selectedItemId={selectedItemId}
          setSelectedItemId={setSelectedItemId}
          onSaveItem={saveItem}
          onDeleteItem={deleteItem}
        />
      )}

      {!loading && page === "recipes" && (
        <RecipesPage
          recipes={recipes}
          pantry={pantry}
          selectedRecipeId={selectedRecipeId}
          setSelectedRecipeId={setSelectedRecipeId}
          setPage={setPage}
          onSaveRecipe={saveRecipe}
          onDeleteRecipe={deleteRecipe}
        />
      )}

      {!loading && page === "recipeDetail" && selectedRecipe && (
        <RecipeDetailPage
          recipe={selectedRecipe}
          pantry={pantry}
          setPage={setPage}
          onCookRecipe={cookRecipe}
        />
      )}

      {!loading && page === "suggestions" && (
        <SuggestionsPage
          recipes={recipes}
          pantry={pantry}
          setSelectedRecipeId={setSelectedRecipeId}
          setPage={setPage}
          onCookRecipe={cookRecipe}
          onAddMissingToShopping={addMissingToShopping}
        />
      )}

      {!loading && page === "shopping" && (
        <ShoppingListPage
          shoppingList={shoppingList}
          onToggleBought={toggleBought}
          onCheckoutBought={checkoutBought}
          onClearAll={clearAllShopping}
          onAddShoppingItem={addShoppingItem}
        />
      )}
    </Layout>
  );
}