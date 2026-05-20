import { useEffect, useState } from "react";
import Layout from "./components/Layout.jsx";
import PantryPage from "./pages/PantryPage.jsx";
import RecipesPage from "./pages/RecipesPage.jsx";
import SuggestionsPage from "./pages/SuggestionsPage.jsx";
import ShoppingListPage from "./pages/ShoppingListPage.jsx";
import RecipeDetailPage from "./pages/RecipeDetailPage.jsx";
import { pantrySeed, recipeSeed, shoppingSeed } from "./data/mockData.js";
import {
  deductInventory,
  getMissingIngredients,
  mergeShoppingItems,
} from "./utils/pantryLogic.js";

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export default function App() {
  const [page, setPage] = useState("pantry");
  const [pantry, setPantry] = useLocalStorage("pantry", pantrySeed);
  const [recipes, setRecipes] = useLocalStorage("recipes", recipeSeed);
  const [shoppingList, setShoppingList] = useLocalStorage(
    "shoppingList",
    shoppingSeed
  );

  const [selectedItemId, setSelectedItemId] = useState(pantrySeed[0].id);
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipeSeed[0].id);

  const selectedRecipe =
    recipes.find((recipe) => recipe.id === selectedRecipeId) || recipes[0];

  function saveItem(item) {
    setPantry((current) => {
      const exists = current.some((oldItem) => oldItem.id === item.id);

      if (exists) {
        return current.map((oldItem) =>
          oldItem.id === item.id ? item : oldItem
        );
      }

      return [...current, item];
    });

    setSelectedItemId(item.id);
  }

  function deleteItem(id) {
    if (!id) return;

    setPantry((current) => current.filter((item) => item.id !== id));
    setSelectedItemId(null);
  }

  function saveRecipe(recipe) {
    setRecipes((current) => {
      const exists = current.some((oldRecipe) => oldRecipe.id === recipe.id);

      if (exists) {
        return current.map((oldRecipe) =>
          oldRecipe.id === recipe.id ? recipe : oldRecipe
        );
      }

      return [...current, recipe];
    });

    setSelectedRecipeId(recipe.id);
  }

  function deleteRecipe(id) {
    if (!id) return;

    setRecipes((current) => current.filter((recipe) => recipe.id !== id));
    setSelectedRecipeId(null);
  }

  function addMissingToShopping(missingItems) {
    setShoppingList((current) => mergeShoppingItems(current, missingItems));
    setPage("shopping");
  }

  function cookRecipe(recipeId, portions) {
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe) return;

    const missing = getMissingIngredients(recipe, pantry, portions);

    if (missing.length > 0) {
      addMissingToShopping(missing);
      return;
    }

    setPantry((current) => deductInventory(current, recipe, portions));
    setPage("pantry");
  }

  function toggleBought(id) {
    setShoppingList((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isBought: !item.isBought } : item
      )
    );
  }

  function clearBought() {
    setShoppingList((current) => current.filter((item) => !item.isBought));
  }

  function clearAllShopping() {
    setShoppingList([]);
  }

  return (
    <Layout page={page} setPage={setPage}>
      {page === "pantry" && (
        <PantryPage
          pantry={pantry}
          selectedItemId={selectedItemId}
          setSelectedItemId={setSelectedItemId}
          onSaveItem={saveItem}
          onDeleteItem={deleteItem}
        />
      )}

      {page === "recipes" && (
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

      {page === "recipeDetail" && selectedRecipe && (
        <RecipeDetailPage
          recipe={selectedRecipe}
          pantry={pantry}
          setPage={setPage}
          onCookRecipe={cookRecipe}
        />
      )}

      {page === "suggestions" && (
        <SuggestionsPage
          recipes={recipes}
          pantry={pantry}
          setSelectedRecipeId={setSelectedRecipeId}
          setPage={setPage}
          onCookRecipe={cookRecipe}
          onAddMissingToShopping={addMissingToShopping}
        />
      )}

      {page === "shopping" && (
        <ShoppingListPage
          shoppingList={shoppingList}
          onToggleBought={toggleBought}
          onClearBought={clearBought}
          onClearAll={clearAllShopping}
        />
      )}
    </Layout>
  );
}