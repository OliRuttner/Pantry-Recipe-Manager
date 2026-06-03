import { diets } from "../data/constants.js";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5218/api";

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
        ...options,
    });

    if (response.status === 204) return null;

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        const message = data?.message ?? data?.title ?? data ?? "API request failed";
        throw new Error(typeof message === "string" ? message : JSON.stringify(message));
    }

    return data;
}

function toDateInput(value) {
    if (!value) return "";
    return String(value).slice(0, 10);
}

export function toClientItem(item) {
    return {
        ...item,
        category: item.category ?? "Other",
        expirationDate: toDateInput(item.expirationDate),
    };
}

export function toClientRecipe(recipe) {
    return {
        ...recipe,
        diet: typeof recipe.diet === "number" ? diets[recipe.diet] : recipe.diet ?? "None",
        ingredients: (recipe.ingredients ?? []).map((ingredient) => ({
            id: ingredient.itemId ?? ingredient.id,
            itemId: ingredient.itemId ?? ingredient.id,
            name: ingredient.item?.name ?? ingredient.name ?? ingredient.ingredientName ?? "",
            quantity: ingredient.requiredQuantity ?? ingredient.quantity ?? ingredient.quantityNeeded ?? 0,
            unit: ingredient.item?.unit ?? ingredient.unit ?? "g",
        })),
    };
}

function toApiItem(item) {
    return {
        ...(item.id ? { id: item.id } : {}),
        name: item.name,
        quantity: Number(item.quantity),
        unit: item.unit,
        category: item.category ?? "Other",
        expirationDate: item.expirationDate || null,
        isEssential: Boolean(item.isEssential),
        lowStockThreshold: Number(item.lowStockThreshold),
    };
}

async function ensureInventoryItem(ingredient, pantry) {
    const existing = pantry.find(
        (item) => item.name.trim().toLowerCase() === ingredient.name.trim().toLowerCase()
    );

    if (existing) return existing;

    return api.createInventoryItem({
        name: ingredient.name,
        quantity: 0,
        unit: ingredient.unit,
        category: "Other",
        expirationDate: "",
        isEssential: false,
        lowStockThreshold: 0,
    });
}

async function toApiRecipe(recipe, pantry) {
    const ingredients = [];

    for (const ingredient of recipe.ingredients ?? []) {
        const item = ingredient.itemId
            ? pantry.find((pantryItem) => pantryItem.id === ingredient.itemId) ?? ingredient
            : await ensureInventoryItem(ingredient, pantry);

        ingredients.push({
            itemId: item.id ?? item.itemId,
            requiredQuantity: Number(ingredient.quantity),
        });
    }

    return {
        ...(recipe.id ? { id: recipe.id } : {}),
        name: recipe.name,
        caloriesPerPortion: Number(recipe.caloriesPerPortion),
        basePortions: Number(recipe.basePortions),
        diet: recipe.diet,
        allergens: recipe.allergens ?? "",
        instructions: recipe.instructions ?? "",
        ingredients,
    };
}

export const api = {
    async getInventory() {
        const data = await request("/Inventory");
        return data.map(toClientItem);
    },

    async createInventoryItem(item) {
        const data = await request("/Inventory", {
            method: "POST",
            body: JSON.stringify(toApiItem(item)),
        });

        return toClientItem(data);
    },

    async updateInventoryItem(item) {
        await request(`/Inventory/${item.id}`, {
            method: "PUT",
            body: JSON.stringify(toApiItem(item)),
        });
    },

    async deleteInventoryItem(id) {
        await request(`/Inventory/${id}`, { method: "DELETE" });
    },

    async getRecipes() {
        const data = await request("/Recipes");
        return data.map(toClientRecipe);
    },

    async createRecipe(recipe, pantry) {
        const payload = await toApiRecipe(recipe, pantry);

        const data = await request("/Recipes", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        return toClientRecipe(data);
    },

    async updateRecipe(recipe, pantry) {
        const payload = await toApiRecipe(recipe, pantry);

        await request(`/Recipes/${recipe.id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },

    async deleteRecipe(id) {
        await request(`/Recipes/${id}`, { method: "DELETE" });
    },

    async cookRecipe(recipeId, portions) {
        return request(`/Recipes/${recipeId}/cook`, {
            method: "POST",
            body: JSON.stringify({ portions: Number(portions) }),
        });
    },

    async getShoppingList() {
        return request("/ShoppingList");
    },

    async addShoppingItem(item) {
        return request("/ShoppingList/manual-add", {
            method: "POST",
            body: JSON.stringify({
                ingredientName: item.ingredientName,
                quantityNeeded: Number(item.quantityNeeded),
                unit: item.unit,
                isBought: false,
            }),
        });
    },

    async toggleShoppingItem(id) {
        await request(`/ShoppingList/${id}/toggle-bought`, { method: "PATCH" });
    },

    async clearBoughtShoppingItems() {
        await request("/ShoppingList/clear-bought", { method: "DELETE" });
    },

    async checkoutBoughtShoppingItems() {
        return request("/ShoppingList/checkout-bought", { method: "POST" });
    },

    async bulkCheckout(items) {
        return request("/ShoppingList/bulk-checkout", {
            method: "POST",
            body: JSON.stringify(
                items.map((item) => ({
                    shoppingListItemId: item.id,
                    actualQuantityBought: Number(item.quantityNeeded),
                }))
            ),
        });
    },

    async deleteShoppingItem(id) {
        await request(`/ShoppingList/${id}`, { method: "DELETE" });
    },
};