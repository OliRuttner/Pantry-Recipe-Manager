import React, { useEffect, useMemo, useState } from "react";

const inventorySeed = [
  { id: 1, name: "Eggs", quantity: 6, unit: "pcs", expirationDate: "2026-05-02", isEssential: true, lowStockThreshold: 4 },
  { id: 2, name: "Spaghetti", quantity: 500, unit: "g", expirationDate: "2028-02-09", isEssential: true, lowStockThreshold: 200 },
  { id: 3, name: "Guanciale", quantity: 300, unit: "g", expirationDate: "2026-12-27", isEssential: false, lowStockThreshold: 120 },
  { id: 4, name: "Potatoes", quantity: 600, unit: "g", expirationDate: "2026-06-03", isEssential: true, lowStockThreshold: 500 },
  { id: 5, name: "Onion", quantity: 300, unit: "g", expirationDate: "2026-06-28", isEssential: true, lowStockThreshold: 200 },
  { id: 6, name: "Flour", quantity: 1000, unit: "g", expirationDate: "2027-01-20", isEssential: true, lowStockThreshold: 300 },
  { id: 7, name: "Salt", quantity: 250, unit: "g", expirationDate: null, isEssential: true, lowStockThreshold: 100 },
  { id: 8, name: "Pepper", quantity: 80, unit: "g", expirationDate: "2028-12-30", isEssential: false, lowStockThreshold: 20 },
  { id: 9, name: "Olive Oil", quantity: 500, unit: "mL", expirationDate: "2027-08-14", isEssential: true, lowStockThreshold: 100 },
  { id: 10, name: "Parmigiano Reggiano", quantity: 40, unit: "g", expirationDate: "2026-05-18", isEssential: false, lowStockThreshold: 60 },
];

const recipeSeed = [
  {
    id: 101,
    name: "Hashbrowns",
    caloriesPerPortion: 326,
    basePortions: 2,
    dietType: "Vegetarian",
    allergens: "None",
    instructions:
      "Grate the potatoes, lightly season with salt, squeeze out the extra moisture, then pan-fry in olive oil until golden and crisp on both sides.",
    ingredients: [
      { recipeId: 101, itemId: 4, name: "Potatoes", requiredQuantity: 500, unit: "g" },
      { recipeId: 101, itemId: 7, name: "Salt", requiredQuantity: 4, unit: "g" },
      { recipeId: 101, itemId: 9, name: "Olive Oil", requiredQuantity: 20, unit: "mL" },
    ],
  },
  {
    id: 102,
    name: "Pasta Carbonara",
    caloriesPerPortion: 750,
    basePortions: 1,
    dietType: "None",
    allergens: "Eggs, Dairy, Gluten",
    instructions:
      "Boil spaghetti in salted water. Crisp the guanciale gently. Mix egg yolk with grated parmigiano and pepper. Toss the hot pasta with guanciale, remove from heat, then stir in the egg mixture with a splash of pasta water until silky.",
    ingredients: [
      { recipeId: 102, itemId: 2, name: "Spaghetti", requiredQuantity: 100, unit: "g" },
      { recipeId: 102, itemId: 1, name: "Eggs", requiredQuantity: 1, unit: "pcs" },
      { recipeId: 102, itemId: 10, name: "Parmigiano Reggiano", requiredQuantity: 40, unit: "g" },
      { recipeId: 102, itemId: 3, name: "Guanciale", requiredQuantity: 60, unit: "g" },
      { recipeId: 102, itemId: 8, name: "Pepper", requiredQuantity: 4, unit: "g" },
      { recipeId: 102, itemId: 7, name: "Salt", requiredQuantity: 4, unit: "g" },
    ],
  },
  {
    id: 103,
    name: "Garden Veggie Pasta",
    caloriesPerPortion: 410,
    basePortions: 2,
    dietType: "Vegan",
    allergens: "Gluten",
    instructions:
      "Saute the onion in olive oil until soft. Toss with cooked spaghetti, finish with pepper and herbs, then serve warm.",
    ingredients: [
      { recipeId: 103, itemId: 2, name: "Spaghetti", requiredQuantity: 180, unit: "g" },
      { recipeId: 103, itemId: 5, name: "Onion", requiredQuantity: 200, unit: "g" },
      { recipeId: 103, itemId: 9, name: "Olive Oil", requiredQuantity: 30, unit: "mL" },
      { recipeId: 103, itemId: 8, name: "Pepper", requiredQuantity: 3, unit: "g" },
    ],
  },
  {
    id: 104,
    name: "Simple Omelette",
    caloriesPerPortion: 290,
    basePortions: 1,
    dietType: "Vegetarian",
    allergens: "Eggs",
    instructions:
      "Beat the eggs with salt and pepper, cook gently in a lightly oiled pan, and fold when just set.",
    ingredients: [
      { recipeId: 104, itemId: 1, name: "Eggs", requiredQuantity: 2, unit: "pcs" },
      { recipeId: 104, itemId: 7, name: "Salt", requiredQuantity: 2, unit: "g" },
      { recipeId: 104, itemId: 8, name: "Pepper", requiredQuantity: 1, unit: "g" },
      { recipeId: 104, itemId: 9, name: "Olive Oil", requiredQuantity: 10, unit: "mL" },
    ],
  },
];

const unitOptions = ["g", "kg", "pcs", "mL", "L"];
const dietOptions = ["None", "Vegetarian", "Vegan"];
const inventoryFilters = ["All", "Expiring soon", "Low stock", "Essential only"];

const navItems = [
  { key: "pantry", label: "Pantry", icon: "🥬" },
  { key: "recipes", label: "Recipes", icon: "🍳" },
  { key: "suggestions", label: "Ideas", icon: "✨" },
  { key: "shopping", label: "Shopping", icon: "🧺" },
];

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatQty(value) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.00$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}

function daysUntil(dateString) {
  if (!dateString) return Number.POSITIVE_INFINITY;
  const today = new Date("2026-05-01");
  const target = new Date(dateString);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function getInventoryStatus(item) {
  const expDays = daysUntil(item.expirationDate);
  const low = item.quantity <= item.lowStockThreshold;
  const expired = expDays < 0;

  if (expired) {
    return { label: "Expired", tone: "bg-rose-100 text-rose-700 ring-rose-200" };
  }
  if (expDays <= 7) {
    return { label: "Expiring soon", tone: "bg-orange-100 text-orange-700 ring-orange-200" };
  }
  if (low) {
    return { label: "Low stock", tone: "bg-amber-100 text-amber-700 ring-amber-200" };
  }
  return { label: "Fresh", tone: "bg-lime-100 text-lime-700 ring-lime-200" };
}

function getDietTone(diet) {
  if (diet === "Vegan") return "bg-[#dce4c7] text-[#6e744a]";
  if (diet === "Vegetarian") return "bg-[#e7edd7] text-[#76804e]";
  return "bg-[#efe7dd] text-[#7d6958]";
}

function getItemForIngredient(ingredient, inventory) {
  return (
    inventory.find((item) => item.id === ingredient.itemId) ||
    inventory.find((item) => item.name === ingredient.name)
  );
}

function getMaxPortions(recipe, inventory) {
  const limits = recipe.ingredients.map((ingredient) => {
    const matchingItem = getItemForIngredient(ingredient, inventory);
    if (!matchingItem) return 0;
    return Math.floor(matchingItem.quantity / ingredient.requiredQuantity);
  });

  return Math.max(0, Math.min(...limits));
}

function getMissingIngredients(recipe, inventory) {
  return recipe.ingredients
    .map((ingredient) => {
      const matchingItem = getItemForIngredient(ingredient, inventory);
      const currentQuantity = matchingItem?.quantity ?? 0;
      const missing = Math.max(0, ingredient.requiredQuantity - currentQuantity);

      return missing > 0
        ? {
          name: ingredient.name,
          quantityNeeded: missing,
          unit: ingredient.unit,
          bought: false,
          source: "Missing for selected recipe",
        }
        : null;
    })
    .filter(Boolean);
}

function getAutomaticRestock(inventory) {
  return inventory
    .filter((item) => item.isEssential && item.quantity <= item.lowStockThreshold)
    .map((item) => ({
      ingredientName: item.name,
      quantityNeeded: Math.max(item.lowStockThreshold * 2 - item.quantity, 1),
      unit: item.unit,
      bought: false,
      reason: item.quantity === 0 ? "Out of stock" : "Below threshold",
    }));
}

function App() {
  const [activePage, setActivePage] = useState("pantry");
  const [inventoryFilter, setInventoryFilter] = useState("All");
  const [inventorySearch, setInventorySearch] = useState("");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState(102);
  const [selectedItemId, setSelectedItemId] = useState(5);
  const [portionCount, setPortionCount] = useState(1);
  const [dietChecks, setDietChecks] = useState({
    Vegetarian: false,
    Vegan: false,
    "Gluten free": false,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSheet, setMobileSheet] = useState({ open: false, type: null });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [boughtMap, setBoughtMap] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      setScrollProgress(Math.max(0, Math.min(100, progress)));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const selectedRecipe =
    recipeSeed.find((recipe) => recipe.id === selectedRecipeId) ?? recipeSeed[0];

  const selectedInventoryItem =
    inventorySeed.find((item) => item.id === selectedItemId) ?? inventorySeed[0];

  const filteredInventory = useMemo(() => {
    return inventorySeed.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(inventorySearch.toLowerCase());

      const expDays = daysUntil(item.expirationDate);
      const lowStock = item.quantity <= item.lowStockThreshold;

      let matchesFilter = true;
      if (inventoryFilter === "Expiring soon") matchesFilter = expDays <= 7;
      if (inventoryFilter === "Low stock") matchesFilter = lowStock;
      if (inventoryFilter === "Essential only") matchesFilter = item.isEssential;

      return matchesSearch && matchesFilter;
    });
  }, [inventoryFilter, inventorySearch]);

  const filteredRecipes = useMemo(() => {
    return recipeSeed.filter((recipe) => {
      const matchesSearch = recipe.name
        .toLowerCase()
        .includes(recipeSearch.toLowerCase());

      const vegetarianPass =
        !dietChecks.Vegetarian ||
        recipe.dietType === "Vegetarian" ||
        recipe.dietType === "Vegan";

      const veganPass = !dietChecks.Vegan || recipe.dietType === "Vegan";

      const glutenFreePass =
        !dietChecks["Gluten free"] ||
        !recipe.allergens.toLowerCase().includes("gluten");

      return matchesSearch && vegetarianPass && veganPass && glutenFreePass;
    });
  }, [recipeSearch, dietChecks]);

  const suggestionRows = recipeSeed.map((recipe) => {
    const missing = getMissingIngredients(recipe, inventorySeed);
    return {
      ...recipe,
      missing,
      canCook: missing.length === 0,
      maxPortions: getMaxPortions(recipe, inventorySeed),
    };
  });

  const missingForSelectedRecipe = getMissingIngredients(
    selectedRecipe,
    inventorySeed
  );

  const shoppingRowsBase = [
    ...missingForSelectedRecipe,
    ...getAutomaticRestock(inventorySeed)
      .filter(
        (restock) =>
          !missingForSelectedRecipe.some(
            (missing) => missing.name === restock.ingredientName
          )
      )
      .map((restock) => ({
        name: restock.ingredientName,
        quantityNeeded: restock.quantityNeeded,
        unit: restock.unit,
        bought: false,
        source: restock.reason,
      })),
  ];

  const shoppingRows = shoppingRowsBase.map((item) => ({
    ...item,
    bought: boughtMap[item.name] ?? item.bought ?? false,
  }));

  const expiringItems = inventorySeed
    .filter((item) => daysUntil(item.expirationDate) <= 21)
    .slice(0, 4);

  const lowStockEssentials = inventorySeed.filter(
    (item) => item.isEssential && item.quantity <= item.lowStockThreshold
  );

  const maxPossible = getMaxPortions(selectedRecipe, inventorySeed);

  const dashboardStats = [
    { label: "Inventory items", value: inventorySeed.length, icon: "🥕" },
    { label: "Recipes saved", value: recipeSeed.length, icon: "🍝" },
    { label: "Low essentials", value: lowStockEssentials.length, icon: "🧂" },
    { label: "Expiring soon", value: expiringItems.length, icon: "⏰" },
  ];

  function openItemSheet(itemId) {
    setSelectedItemId(itemId);
    setMobileSheet({ open: true, type: "item" });
  }

  function openRecipeSheet(recipeId) {
    setSelectedRecipeId(recipeId);
    setMobileSheet({ open: true, type: "recipe" });
  }

  function toggleBought(name) {
    setBoughtMap((current) => ({
      ...current,
      [name]: !current[name],
    }));
  }

  function markAllBought() {
    const updates = {};
    shoppingRows.forEach((item) => {
      updates[item.name] = true;
    });
    setBoughtMap((current) => ({ ...current, ...updates }));
  }

  function clearBought() {
    const updates = {};
    shoppingRows.forEach((item) => {
      updates[item.name] = false;
    });
    setBoughtMap((current) => ({ ...current, ...updates }));
  }

  return (
    <div className="min-h-screen bg-[#f7f1e7] text-[#4f443d]">
      <BackgroundDecor />
      <CookieCorner progress={scrollProgress} />

      <header className="sticky top-0 z-40 border-b border-white/50 bg-[#f7f1e7]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="k-shadow flex items-center justify-between rounded-[30px] border border-[#e6dcc8] bg-gradient-to-r from-[#9D9D6D] via-[#8f9962] to-[#B89776] px-4 py-4 text-white sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f3ead7] font-black text-[#964212] shadow-inner">
                LO
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/75">
                  Smart kitchen
                </p>
                <h1 className="truncate text-lg font-black sm:text-2xl">
                  Pantry Recipe Manager
                </h1>
              </div>
            </div>

            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActivePage(item.key)}
                  className={`rounded-2xl px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] transition ${activePage === item.key
                      ? "bg-white text-[#7b6e55] shadow-lg"
                      : "text-white/85 hover:bg-white/15 hover:text-white"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-white/12 text-xl md:hidden"
            >
              ☰
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="soft-pop mt-3 grid gap-2 rounded-[24px] border border-[#e9dec5] bg-white p-3 md:hidden">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActivePage(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activePage === item.key
                      ? "bg-[#ede7d4] text-[#7d6958]"
                      : "bg-stone-50 text-stone-700"
                    }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-10">
        <section className="fade-up mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat) => (
            <div
              key={stat.label}
              className="k-shadow rounded-[28px] border border-white/70 bg-white/80 p-5 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-black text-stone-800">{stat.value}</p>
                </div>
                <div className="floaty grid h-12 w-12 place-items-center rounded-2xl bg-[#f3ead7] text-xl">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        {activePage === "pantry" && (
          <PantryPage
            inventoryFilter={inventoryFilter}
            setInventoryFilter={setInventoryFilter}
            inventorySearch={inventorySearch}
            setInventorySearch={setInventorySearch}
            filteredInventory={filteredInventory}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            selectedInventoryItem={selectedInventoryItem}
            expiringItems={expiringItems}
            openItemSheet={openItemSheet}
          />
        )}

        {activePage === "recipes" && (
          <RecipesPage
            recipeSearch={recipeSearch}
            setRecipeSearch={setRecipeSearch}
            dietChecks={dietChecks}
            setDietChecks={setDietChecks}
            filteredRecipes={filteredRecipes}
            selectedRecipeId={selectedRecipeId}
            setSelectedRecipeId={setSelectedRecipeId}
            selectedRecipe={selectedRecipe}
            portionCount={portionCount}
            setPortionCount={setPortionCount}
            maxPossible={maxPossible}
            openRecipeSheet={openRecipeSheet}
          />
        )}

        {activePage === "suggestions" && (
          <SuggestionsPage
            suggestionRows={suggestionRows}
            selectedRecipe={selectedRecipe}
            selectedRecipeId={selectedRecipeId}
            setSelectedRecipeId={setSelectedRecipeId}
            setActivePage={setActivePage}
            inventory={inventorySeed}
            openRecipeSheet={openRecipeSheet}
          />
        )}

        {activePage === "shopping" && (
          <ShoppingPage
            shoppingRows={shoppingRows}
            selectedRecipe={selectedRecipe}
            toggleBought={toggleBought}
            markAllBought={markAllBought}
            clearBought={clearBought}
            lowStockEssentials={lowStockEssentials}
            expiringItems={expiringItems}
          />
        )}
      </main>

      <MobileSheet
        open={mobileSheet.open}
        onClose={() => setMobileSheet({ open: false, type: null })}
        title={mobileSheet.type === "item" ? "Item details" : "Recipe preview"}
      >
        {mobileSheet.type === "item" ? (
          <div className="space-y-4">
            <ItemDetailsCard item={selectedInventoryItem} />
            <MiniListCard
              title="Expiring soon"
              subtitle="Keep an eye on these items"
              rows={expiringItems.map((item) => ({
                title: item.name,
                subtitle: `Expires ${formatDate(item.expirationDate)}`,
                badge: `${daysUntil(item.expirationDate)} day${daysUntil(item.expirationDate) === 1 ? "" : "s"
                  }`,
              }))}
            />
          </div>
        ) : (
          <RecipePreviewCard
            selectedRecipe={selectedRecipe}
            portionCount={portionCount}
            setPortionCount={setPortionCount}
            maxPossible={maxPossible}
          />
        )}
      </MobileSheet>

      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
}

function PantryPage({
  inventoryFilter,
  setInventoryFilter,
  inventorySearch,
  setInventorySearch,
  filteredInventory,
  selectedItemId,
  setSelectedItemId,
  selectedInventoryItem,
  expiringItems,
  openItemSheet,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
      <div className="min-w-0 space-y-6 fade-up">
        <SectionCard>
          <SectionHeader
            eyebrow="Inventory"
            title="My Pantry"
            description="Track ingredients, expiration dates, stock levels, and essential kitchen basics."
            rightContent={
              <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                <div className="relative">
                  <input
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Search ingredient"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 pr-10 text-sm text-stone-700 outline-none transition focus:border-[#9D9D6D] focus:bg-white sm:w-[220px]"
                  />
                  <span className="pointer-events-none absolute right-4 top-3 text-stone-400">⌕</span>
                </div>

                <select
                  value={inventoryFilter}
                  onChange={(e) => setInventoryFilter(e.target.value)}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-[#9D9D6D] focus:bg-white"
                >
                  {inventoryFilters.map((filter) => (
                    <option key={filter}>{filter}</option>
                  ))}
                </select>
              </div>
            }
          />

          <div className="hidden overflow-hidden rounded-[24px] border border-[#eadcc4] md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#f3ead7] text-xs uppercase tracking-[0.22em] text-[#964212]">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Quantity</th>
                    <th className="px-5 py-4">Unit</th>
                    <th className="px-5 py-4">Exp date</th>
                    <th className="px-5 py-4">Essential</th>
                    <th className="px-5 py-4">Threshold</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const status = getInventoryStatus(item);
                    const isSelected = item.id === selectedItemId;

                    return (
                      <tr
                        key={item.id}
                        data-clickable="true"
                        onClick={() => setSelectedItemId(item.id)}
                        className={`border-t border-[#f4ead7] transition ${isSelected ? "bg-[#fbf6ed]" : "bg-white hover:bg-lime-50/40"
                          }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`grid h-11 w-11 place-items-center rounded-2xl text-sm font-bold ${isSelected
                                  ? "bg-[#efddd0] text-[#964212]"
                                  : "bg-[#e7edd7] text-[#6f774a]"
                                }`}
                            >
                              {item.name[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-stone-800">{item.name}</p>
                              <p className="text-xs text-stone-400">Item ID #{item.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-stone-700">
                          {formatQty(item.quantity)}
                        </td>
                        <td className="px-5 py-4 text-stone-600">{item.unit}</td>
                        <td className="px-5 py-4 text-stone-600">{formatDate(item.expirationDate)}</td>
                        <td className="px-5 py-4">
                          <Pill tone={item.isEssential ? "sage" : "stone"}>
                            {item.isEssential ? "Yes" : "No"}
                          </Pill>
                        </td>
                        <td className="px-5 py-4 text-stone-600">
                          {formatQty(item.lowStockThreshold)} {item.unit}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${status.tone}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4 md:hidden">
            {filteredInventory.map((item) => {
              const status = getInventoryStatus(item);

              return (
                <div
                  key={item.id}
                  className={`rounded-[24px] border p-4 transition ${item.id === selectedItemId
                      ? "border-[#d8c8ab] bg-[#fbf6ed]"
                      : "border-[#eadcc4] bg-white"
                    }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e7edd7] font-bold text-[#6f774a]">
                        {item.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-stone-800">{item.name}</p>
                        <p className="text-xs text-stone-400">Item ID #{item.id}</p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${status.tone}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-stone-600">
                    <SmallFact label="Quantity" value={`${formatQty(item.quantity)} ${item.unit}`} />
                    <SmallFact label="Expiry" value={formatDate(item.expirationDate)} />
                    <SmallFact label="Essential" value={item.isEssential ? "Yes" : "No"} />
                    <SmallFact
                      label="Threshold"
                      value={`${formatQty(item.lowStockThreshold)} ${item.unit}`}
                    />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <ActionButton tone="rust" onClick={() => setSelectedItemId(item.id)}>
                      Select
                    </ActionButton>
                    <ActionButton tone="soft" onClick={() => openItemSheet(item.id)}>
                      Details
                    </ActionButton>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ActionButton tone="sage">+ Add item</ActionButton>
            <ActionButton tone="rose">✎ Edit</ActionButton>
            <ActionButton tone="red">🗑 Delete</ActionButton>
          </div>
        </SectionCard>
      </div>

      <div className="min-w-0 space-y-6 fade-up">
        <ItemDetailsCard item={selectedInventoryItem} />
        <MiniListCard
          title="Kitchen reminders"
          subtitle="Items that need attention soon"
          rows={expiringItems.map((item) => ({
            title: item.name,
            subtitle: `Expires ${formatDate(item.expirationDate)}`,
            badge: `${daysUntil(item.expirationDate)} day${daysUntil(item.expirationDate) === 1 ? "" : "s"
              }`,
          }))}
        />
      </div>
    </div>
  );
}

function RecipesPage({
  recipeSearch,
  setRecipeSearch,
  dietChecks,
  setDietChecks,
  filteredRecipes,
  selectedRecipeId,
  setSelectedRecipeId,
  selectedRecipe,
  portionCount,
  setPortionCount,
  maxPossible,
  openRecipeSheet,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="min-w-0 space-y-6 fade-up">
        <SectionCard>
          <SectionHeader
            eyebrow="Recipe catalog"
            title="My Recipes"
            description="Browse recipes, filter by diet, and preview them in a cleaner kitchen-style layout."
            rightContent={
              <div className="relative">
                <input
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  placeholder="Search recipe"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 pr-10 text-sm text-stone-700 outline-none transition focus:border-[#9D9D6D] focus:bg-white sm:w-[220px]"
                />
                <span className="pointer-events-none absolute right-4 top-3 text-stone-400">⌕</span>
              </div>
            }
          />

          <div className="mb-5 flex flex-wrap gap-3 text-sm text-stone-700">
            {Object.keys(dietChecks).map((diet) => (
              <label
                key={diet}
                className="flex items-center gap-3 rounded-full border border-stone-200 bg-stone-50 px-4 py-2"
              >
                <input
                  type="checkbox"
                  checked={dietChecks[diet]}
                  onChange={() =>
                    setDietChecks((current) => ({ ...current, [diet]: !current[diet] }))
                  }
                  className="h-4 w-4 rounded border-stone-300"
                />
                {diet}
              </label>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[24px] border border-[#eadcc4] md:block">
            <table className="min-w-full text-left">
              <thead className="bg-[#f3ead7] text-xs uppercase tracking-[0.22em] text-[#964212]">
                <tr>
                  <th className="px-5 py-4">Recipe</th>
                  <th className="px-5 py-4">Calories</th>
                  <th className="px-5 py-4">Portions</th>
                  <th className="px-5 py-4">Diet</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecipes.map((recipe) => (
                  <tr
                    key={recipe.id}
                    data-clickable="true"
                    onClick={() => setSelectedRecipeId(recipe.id)}
                    className={`border-t border-[#f4ead7] transition ${recipe.id === selectedRecipeId
                        ? "bg-[#fbf6ed]"
                        : "bg-white hover:bg-lime-50/40"
                      }`}
                  >
                    <td className="px-5 py-4 font-semibold text-stone-800">{recipe.name}</td>
                    <td className="px-5 py-4 text-stone-600">{recipe.caloriesPerPortion}</td>
                    <td className="px-5 py-4 text-stone-600">{recipe.basePortions}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getDietTone(
                          recipe.dietType
                        )}`}
                      >
                        {recipe.dietType}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className={`rounded-[24px] border p-4 transition ${recipe.id === selectedRecipeId
                    ? "border-[#d8c8ab] bg-[#fbf6ed]"
                    : "border-[#eadcc4] bg-white"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-stone-800">{recipe.name}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      {recipe.caloriesPerPortion} kcal • {recipe.basePortions} portion(s)
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getDietTone(
                      recipe.dietType
                    )}`}
                  >
                    {recipe.dietType}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <ActionButton tone="rust" onClick={() => setSelectedRecipeId(recipe.id)}>
                    Select
                  </ActionButton>
                  <ActionButton tone="soft" onClick={() => openRecipeSheet(recipe.id)}>
                    Preview
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ActionButton tone="sage">+ Add</ActionButton>
            <ActionButton tone="soft">👁 View</ActionButton>
            <ActionButton tone="rose">✎ Edit</ActionButton>
            <ActionButton tone="red">🗑 Delete</ActionButton>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeader
            eyebrow="Recipe editor"
            title="Add Recipe"
            description="Static recipe form styled like the rest of the app."
            rightContent={<Pill tone="cream">Static form</Pill>}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <InputCard label="Name" value={selectedRecipe.name} />
            <InputCard label="Calories / portion" value={String(selectedRecipe.caloriesPerPortion)} />
            <InputCard label="Base portions" value={String(selectedRecipe.basePortions)} />
            <SelectCard label="Diet type" value={selectedRecipe.dietType} options={dietOptions} />
          </div>

          <div className="mt-4">
            <InputCard label="Allergens" value={selectedRecipe.allergens} />
          </div>

          <div className="mt-6 rounded-[24px] border border-stone-200 bg-[#fcfaf6] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                  RecipeIngredient composition
                </p>
                <h3 className="mt-1 text-2xl font-black text-stone-800">Add Ingredient</h3>
              </div>
              <ActionButton tone="sage">+ Add row</ActionButton>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <InputCard label="Ingredient name" value={selectedRecipe.ingredients[0]?.name ?? ""} />
              <InputCard
                label="Quantity"
                value={String(selectedRecipe.ingredients[0]?.requiredQuantity ?? "")}
              />
              <SelectCard
                label="Unit"
                value={selectedRecipe.ingredients[0]?.unit ?? "g"}
                options={unitOptions}
              />
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadcc4] bg-white">
              <table className="min-w-full text-left">
                <thead className="bg-[#f3ead7] text-xs uppercase tracking-[0.22em] text-[#964212]">
                  <tr>
                    <th className="px-4 py-3">Ingredient</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <tr
                      key={`${ingredient.itemId}-${index}`}
                      className={`border-t border-[#f4ead7] ${index % 2 === 1 ? "bg-[#fbf6ed]" : "bg-white"
                        }`}
                    >
                      <td className="px-4 py-3 font-medium text-stone-700">{ingredient.name}</td>
                      <td className="px-4 py-3 text-stone-600">{ingredient.requiredQuantity}</td>
                      <td className="px-4 py-3 text-stone-600">{ingredient.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <ActionButton tone="rose">✎ Edit ingredient</ActionButton>
              <ActionButton tone="red">🗑 Delete ingredient</ActionButton>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Instructions
            </label>
            <textarea
              rows={6}
              value={selectedRecipe.instructions}
              readOnly
              className="w-full rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-700 outline-none"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ActionButton tone="sage">Save recipe</ActionButton>
            <ActionButton tone="soft">Cancel</ActionButton>
          </div>
        </SectionCard>
      </div>

      <div className="min-w-0 fade-up">
        <RecipePreviewCard
          selectedRecipe={selectedRecipe}
          portionCount={portionCount}
          setPortionCount={setPortionCount}
          maxPossible={maxPossible}
        />
      </div>
    </div>
  );
}

function SuggestionsPage({
  suggestionRows,
  selectedRecipe,
  selectedRecipeId,
  setSelectedRecipeId,
  setActivePage,
  inventory,
  openRecipeSheet,
}) {
  const automaticRestock = getAutomaticRestock(inventory);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="min-w-0 space-y-6 fade-up">
        <SectionCard>
          <SectionHeader
            eyebrow="Suggestion hub"
            title="What you can cook today"
            description="Recipes are checked against your pantry so you can instantly see what is possible."
          />

          <div className="hidden overflow-hidden rounded-[24px] border border-[#eadcc4] md:block">
            <table className="min-w-full text-left">
              <thead className="bg-[#f3ead7] text-xs uppercase tracking-[0.22em] text-[#964212]">
                <tr>
                  <th className="px-5 py-4">Recipe</th>
                  <th className="px-5 py-4">Missing ingredients</th>
                  <th className="px-5 py-4">Can cook?</th>
                  <th className="px-5 py-4">Max portions</th>
                </tr>
              </thead>
              <tbody>
                {suggestionRows.map((row) => (
                  <tr
                    key={row.id}
                    data-clickable="true"
                    onClick={() => setSelectedRecipeId(row.id)}
                    className={`border-t border-[#f4ead7] transition ${row.id === selectedRecipeId
                        ? "bg-[#fbf6ed]"
                        : "bg-white hover:bg-lime-50/40"
                      }`}
                  >
                    <td className="px-5 py-4 font-semibold text-stone-800">{row.name}</td>
                    <td className="px-5 py-4 text-stone-600">
                      {row.missing.length === 0
                        ? "—"
                        : row.missing.map((item) => item.name).join(", ")}
                    </td>
                    <td className="px-5 py-4">
                      <Pill tone={row.canCook ? "sage" : "rose"}>
                        {row.canCook ? "Yes" : "No"}
                      </Pill>
                    </td>
                    <td className="px-5 py-4 text-stone-600">{row.maxPortions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {suggestionRows.map((row) => (
              <div
                key={row.id}
                className={`rounded-[24px] border p-4 transition ${row.id === selectedRecipeId
                    ? "border-[#d8c8ab] bg-[#fbf6ed]"
                    : "border-[#eadcc4] bg-white"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-stone-800">{row.name}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      Missing:{" "}
                      {row.missing.length === 0
                        ? "None"
                        : row.missing.map((item) => item.name).join(", ")}
                    </p>
                  </div>
                  <Pill tone={row.canCook ? "sage" : "rose"}>
                    {row.canCook ? "Can cook" : "Needs items"}
                  </Pill>
                </div>

                <div className="mt-3 text-sm text-stone-600">Max portions: {row.maxPortions}</div>

                <div className="mt-4 flex gap-2">
                  <ActionButton tone="rust" onClick={() => setSelectedRecipeId(row.id)}>
                    Select
                  </ActionButton>
                  <ActionButton tone="soft" onClick={() => openRecipeSheet(row.id)}>
                    Preview
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ActionButton tone="rose" onClick={() => setActivePage("recipes")}>
              🍳 Cook selected recipe
            </ActionButton>
            <ActionButton tone="sage" onClick={() => setActivePage("shopping")}>
              🧺 Send to shopping list
            </ActionButton>
          </div>
        </SectionCard>
      </div>

      <div className="min-w-0 space-y-6 fade-up">
        <SectionCard>
          <SectionHeader
            eyebrow="Current selection"
            title="Selected recipe summary"
            description="Quick snapshot of the recipe you are focusing on."
          />

          <div className="grid gap-4 rounded-[24px] bg-[#fcfaf6] p-5">
            <InfoLine label="Recipe" value={selectedRecipe.name} />
            <InfoLine label="Base portions" value={String(selectedRecipe.basePortions)} />
            <InfoLine
              label="Possible now"
              value={`${getMaxPortions(selectedRecipe, inventory)}x`}
            />
            <InfoLine
              label="Shopping needed"
              value={`${getMissingIngredients(selectedRecipe, inventory).length} item(s)`}
            />
          </div>
        </SectionCard>

        <MiniListCard
          title="Automatic restock"
          subtitle="Essential items that should be replenished"
          rows={automaticRestock.map((item) => ({
            title: item.ingredientName,
            subtitle: `Suggested restock: ${formatQty(item.quantityNeeded)} ${item.unit}`,
            badge: item.reason,
          }))}
        />
      </div>
    </div>
  );
}

function ShoppingPage({
  shoppingRows,
  selectedRecipe,
  toggleBought,
  markAllBought,
  clearBought,
  lowStockEssentials,
  expiringItems,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="min-w-0 fade-up">
        <SectionCard>
          <SectionHeader
            eyebrow="Shopping list"
            title="Missing ingredients"
            description="Everything you still need for the selected recipe plus useful restock suggestions."
            rightContent={<Pill tone="sage">Selected from {selectedRecipe.name}</Pill>}
          />

          <div className="hidden overflow-hidden rounded-[24px] border border-[#eadcc4] md:block">
            <table className="min-w-full text-left">
              <thead className="bg-[#f3ead7] text-xs uppercase tracking-[0.22em] text-[#964212]">
                <tr>
                  <th className="px-5 py-4">Ingredient</th>
                  <th className="px-5 py-4">Qty needed</th>
                  <th className="px-5 py-4">Unit</th>
                  <th className="px-5 py-4">Bought</th>
                  <th className="px-5 py-4">Source</th>
                </tr>
              </thead>
              <tbody>
                {shoppingRows.map((item, index) => (
                  <tr
                    key={`${item.name}-${index}`}
                    className={`border-t border-[#f4ead7] ${index % 2 === 1 ? "bg-[#fbf6ed]" : "bg-white"
                      }`}
                  >
                    <td className="px-5 py-4 font-semibold text-stone-800">{item.name}</td>
                    <td className="px-5 py-4 text-stone-600">{formatQty(item.quantityNeeded)}</td>
                    <td className="px-5 py-4 text-stone-600">{item.unit}</td>
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={Boolean(item.bought)}
                        onChange={() => toggleBought(item.name)}
                        className="h-4 w-4 rounded border-stone-300"
                      />
                    </td>
                    <td className="px-5 py-4 text-sm text-stone-500">{item.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {shoppingRows.map((item, index) => (
              <div key={`${item.name}-${index}`} className="rounded-[24px] border border-[#eadcc4] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-stone-800">{item.name}</p>
                    <p className="mt-1 text-sm text-stone-500">{item.source}</p>
                  </div>
                  <label className="flex items-center gap-2 rounded-full bg-[#e7edd7] px-3 py-2 text-sm font-semibold text-[#6f774a]">
                    <input
                      type="checkbox"
                      checked={Boolean(item.bought)}
                      onChange={() => toggleBought(item.name)}
                      className="h-4 w-4 rounded border-stone-300"
                    />
                    Bought
                  </label>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-stone-600">
                  <SmallFact label="Qty needed" value={formatQty(item.quantityNeeded)} />
                  <SmallFact label="Unit" value={item.unit} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ActionButton tone="soft">🪄 Generate list</ActionButton>
            <ActionButton tone="sage" onClick={markAllBought}>
              ✓ Mark all bought
            </ActionButton>
            <ActionButton tone="red" onClick={clearBought}>
              Clear
            </ActionButton>
          </div>
        </SectionCard>
      </div>

      <div className="min-w-0 space-y-6 fade-up">
        <SectionCard>
          <SectionHeader
            eyebrow="Quick stats"
            title="At a glance"
            description="Helpful little widgets for the shopping workflow."
          />

          <div className="grid grid-cols-2 gap-4">
            <StatCard value={String(shoppingRows.length)} label="Items to buy" icon="🛒" />
            <StatCard
              value={String(shoppingRows.filter((item) => item.bought).length)}
              label="Already bought"
              icon="✅"
            />
            <StatCard value={String(lowStockEssentials.length)} label="Low essentials" icon="🧂" />
            <StatCard value={String(expiringItems.length)} label="Expiring soon" icon="⏳" />
          </div>
        </SectionCard>

        <MiniListCard
          title="How the list is built"
          subtitle="Shopping logic used in the UI"
          rows={[
            {
              title: "GetMissingIngredients(recipeId)",
              subtitle: "Adds ingredients missing from the selected recipe.",
              badge: "Recipe",
            },
            {
              title: "GenerateAutomaticRestock(inventory)",
              subtitle: "Adds low essential items under threshold.",
              badge: "Restock",
            },
          ]}
        />
      </div>
    </div>
  );
}

function BackgroundDecor() {
  return (
    <>
      <div className="pointer-events-none absolute left-[-60px] top-24 h-52 w-52 rounded-full bg-[#d8c8ab]/35 blur-3xl" />
      <div className="pointer-events-none absolute right-[-80px] top-72 h-72 w-72 rounded-full bg-[#b27064]/18 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-[60rem] h-60 w-60 rounded-full bg-[#9d9d6d]/18 blur-3xl" />
    </>
  );
}

function CookieCorner({ progress }) {
  const biteCount = Math.min(5, Math.floor(progress / 20));
  const bites = [
    { left: 48, top: -2, size: 16 },
    { left: 58, top: 10, size: 14 },
    { left: 58, top: 24, size: 14 },
    { left: 49, top: 38, size: 16 },
    { left: 34, top: 49, size: 14 },
  ];

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-30 hidden sm:block">
      <div className="rounded-[28px] border border-[#e6dcc8] bg-white/88 px-4 py-3 shadow-xl backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-[#c89b57]" />
            <div className="absolute inset-[7px] rounded-full bg-[#ddb16c]" />
            <div className="absolute left-[11px] top-[13px] h-2.5 w-2.5 rounded-full bg-[#8c5e2a]" />
            <div className="absolute left-[29px] top-[11px] h-2.5 w-2.5 rounded-full bg-[#8c5e2a]" />
            <div className="absolute left-[18px] top-[30px] h-2.5 w-2.5 rounded-full bg-[#8c5e2a]" />
            <div className="absolute left-[37px] top-[31px] h-2.5 w-2.5 rounded-full bg-[#8c5e2a]" />
            <div className="absolute left-[24px] top-[46px] h-2.5 w-2.5 rounded-full bg-[#8c5e2a]" />

            {bites.slice(0, biteCount).map((bite, index) => (
              <div
                key={index}
                className="absolute rounded-full bg-[#f7f1e7]"
                style={{
                  left: bite.left,
                  top: bite.top,
                  width: bite.size,
                  height: bite.size,
                }}
              />
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-stone-400">
              Scroll snack
            </p>
            <p className="mt-1 text-sm font-bold text-stone-700">
              Cookie eaten: {Math.round(progress)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ activePage, setActivePage }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-[#f7f1e7]/92 px-3 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-4 gap-2 rounded-[24px] border border-[#e9dec5] bg-white p-2 shadow-xl">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActivePage(item.key)}
            className={`rounded-2xl px-2 py-3 text-center transition ${activePage === item.key
                ? "bg-[#ede7d4] text-[#7d6958]"
                : "text-stone-500 hover:bg-stone-50"
              }`}
          >
            <div className="text-base">{item.icon}</div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em]">
              {item.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MobileSheet({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button onClick={onClose} className="absolute inset-0 bg-stone-900/35 backdrop-blur-[1px]" />
      <div className="soft-pop absolute inset-x-0 bottom-0 rounded-t-[32px] border border-[#eadcc4] bg-[#fffdf9] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
              Quick view
            </p>
            <h3 className="mt-1 text-2xl font-black text-stone-800">{title}</h3>
          </div>

          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-stone-100 text-lg text-stone-600"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto pb-3">{children}</div>
      </div>
    </div>
  );
}

function SectionCard({ children }) {
  return (
    <section className="k-shadow rounded-[30px] border border-white/70 bg-white/82 p-5 backdrop-blur sm:p-6">
      {children}
    </section>
  );
}

function SectionHeader({ eyebrow, title, description, rightContent }) {
  return (
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#964212]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-stone-800 sm:text-5xl sm:leading-[1.02]">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-2xl text-sm text-stone-500 sm:text-base">{description}</p>
        )}
      </div>

      {rightContent && <div className="xl:pt-2">{rightContent}</div>}
    </div>
  );
}

function ItemDetailsCard({ item }) {
  return (
    <SectionCard>
      <SectionHeader
        eyebrow="Pantry details"
        title="Selected Item"
        description="Focused details for the currently selected ingredient."
      />

      <div className="grid gap-4">
        <InputCard label="Name" value={item.name} />
        <div className="grid grid-cols-2 gap-4">
          <InputCard label="Quantity" value={formatQty(item.quantity)} />
          <SelectCard label="Unit" value={item.unit} options={unitOptions} />
        </div>
        <InputCard label="Exp date" value={item.expirationDate ?? ""} />
        <div className="grid grid-cols-2 gap-4">
          <ToggleCard label="Essential item" enabled={item.isEssential} />
          <InputCard label="Low stock threshold" value={formatQty(item.lowStockThreshold)} />
        </div>

        <div className="rounded-[24px] bg-[#fcfaf6] p-4">
          <InfoLine label="Current status" value={getInventoryStatus(item).label} />
        </div>

        <ActionButton tone="sage">Save ingredient</ActionButton>
      </div>
    </SectionCard>
  );
}

function RecipePreviewCard({ selectedRecipe, portionCount, setPortionCount, maxPossible }) {
  const scaledIngredients = selectedRecipe.ingredients.map((ingredient) => ({
    ...ingredient,
    scaledQuantity:
      (ingredient.requiredQuantity * portionCount) / selectedRecipe.basePortions,
  }));

  return (
    <SectionCard>
      <SectionHeader
        eyebrow="Recipe page"
        title={selectedRecipe.name}
        description="A cleaner kitchen-style preview for the selected recipe."
        rightContent={<Pill tone="sage">Selected recipe</Pill>}
      />

      <div className="grid gap-4 rounded-[24px] bg-[#fcfaf6] p-5">
        <InfoLine label="Calories" value={`${selectedRecipe.caloriesPerPortion}`} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Portions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from({ length: Math.max(1, maxPossible || 3) }, (_, index) => index + 1).map(
              (count) => (
                <button
                  key={count}
                  onClick={() => setPortionCount(count)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${portionCount === count
                      ? "bg-[#B27064] text-white shadow-lg shadow-[#B27064]/20"
                      : "bg-white text-stone-700 hover:bg-[#f3ead7]"
                    }`}
                >
                  {count}x
                </button>
              )
            )}
          </div>
          <p className="mt-2 text-xs text-stone-500">
            Max portions possible from current inventory: {maxPossible}
          </p>
        </div>
        <InfoLine label="Diet" value={selectedRecipe.dietType} />
        <InfoLine label="Allergens" value={selectedRecipe.allergens} />
      </div>

      <div className="mt-6">
        <h3 className="text-2xl font-black text-stone-800">Ingredients</h3>
        <div className="mt-4 space-y-3">
          {scaledIngredients.map((ingredient) => (
            <div
              key={ingredient.itemId}
              className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
            >
              <div>
                <p className="font-semibold text-stone-700">{ingredient.name}</p>
                <p className="text-xs text-stone-400">RecipeItem #{ingredient.itemId}</p>
              </div>

              <div className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#964212]">
                {formatQty(ingredient.scaledQuantity)} {ingredient.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-2xl font-black text-stone-800">Instructions</h3>
        <div className="mt-4 rounded-[24px] border border-stone-200 bg-stone-50 p-5 text-sm leading-7 text-stone-700">
          {selectedRecipe.instructions}
        </div>
      </div>
    </SectionCard>
  );
}

function MiniListCard({ title, subtitle, rows }) {
  return (
    <SectionCard>
      <SectionHeader eyebrow={subtitle} title={title} />
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="rounded-2xl bg-[#fcfaf6] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-700">{row.title}</p>
                <p className="mt-1 text-sm text-stone-500">{row.subtitle}</p>
              </div>
              <Pill tone="cream">{row.badge}</Pill>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function SmallFact({ label, value }) {
  return (
    <div className="rounded-2xl bg-stone-50 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
        {label}
      </p>
      <p className="mt-1 font-semibold text-stone-700">{value}</p>
    </div>
  );
}

function InputCard({ label, value, placeholder = "Enter value" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
        {label}
      </span>
      <input
        value={value}
        readOnly
        placeholder={placeholder}
        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 outline-none"
      />
    </label>
  );
}

function SelectCard({ label, value, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
        {label}
      </span>
      <select
        value={value}
        disabled
        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function ToggleCard({ label, enabled }) {
  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
        {label}
      </span>
      <div
        className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${enabled ? "border-[#cfd8b1] bg-[#edf2df]" : "border-stone-200 bg-stone-50"
          }`}
      >
        <span className="text-sm font-medium text-stone-700">
          {enabled ? "Enabled" : "Disabled"}
        </span>
        <div
          className={`relative h-7 w-12 rounded-full transition ${enabled ? "bg-[#9D9D6D]" : "bg-stone-300"
            }`}
        >
          <div
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${enabled ? "left-6" : "left-1"
              }`}
          />
        </div>
      </div>
    </div>
  );
}

function Pill({ children, tone = "stone" }) {
  const tones = {
    sage: "bg-[#e7edd7] text-[#6f774a]",
    cream: "bg-[#f3ead7] text-[#8b6b45]",
    rose: "bg-[#edd3cf] text-[#9a5a4d]",
    stone: "bg-stone-100 text-stone-600",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.stone}`}>
      {children}
    </span>
  );
}

function InfoLine({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-stone-800">{value}</p>
    </div>
  );
}

function StatCard({ value, label, icon }) {
  return (
    <div className="rounded-[24px] bg-gradient-to-br from-[#f6efe5] to-[#eef2e2] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-black text-stone-800">{value}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            {label}
          </p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-lg shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ children, tone = "rose", onClick }) {
  const tones = {
    sage:
      "bg-gradient-to-r from-[#9D9D6D] to-[#86875f] text-white shadow-lg shadow-[#9D9D6D]/20 hover:-translate-y-0.5",
    rose:
      "bg-gradient-to-r from-[#B27064] to-[#964212] text-white shadow-lg shadow-[#B27064]/20 hover:-translate-y-0.5",
    rust:
      "bg-[#964212] text-white shadow-lg shadow-[#964212]/20 hover:-translate-y-0.5",
    red:
      "bg-gradient-to-r from-[#c46b6b] to-[#a94b4b] text-white shadow-lg shadow-[#c46b6b]/20 hover:-translate-y-0.5",
    soft:
      "border border-stone-200 bg-white text-stone-700 shadow-sm hover:bg-stone-50",
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${tones[tone] || tones.rose}`}
    >
      {children}
    </button>
  );
}

export default App;