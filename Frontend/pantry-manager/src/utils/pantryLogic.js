function normalizeText(value) {
    return String(value ?? "").trim().toLowerCase();
}

function getIngredientName(ingredient) {
    return (
        ingredient?.name ??
        ingredient?.ingredientName ??
        ingredient?.item?.name ??
        ""
    );
}

function getIngredientUnit(ingredient) {
    return (
        ingredient?.unit ??
        ingredient?.item?.unit ??
        ""
    );
}

function getRequiredQuantity(ingredient) {
    const value =
        ingredient?.quantity ??
        ingredient?.requiredQuantity ??
        ingredient?.quantityNeeded ??
        0;

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
}

function getPantryItemForIngredient(ingredient, pantry) {
    const itemId = ingredient?.itemId ?? ingredient?.id;

    if (itemId) {
        const byId = pantry.find((item) => Number(item.id) === Number(itemId));
        if (byId) return byId;
    }

    const ingredientName = normalizeText(getIngredientName(ingredient));

    return pantry.find(
        (item) => normalizeText(item.name) === ingredientName
    );
}

export function getAvailableQuantity(ingredientOrName, pantry) {
    const ingredient =
        typeof ingredientOrName === "string"
            ? { name: ingredientOrName }
            : ingredientOrName;

    const pantryItem = getPantryItemForIngredient(ingredient, pantry);
    const quantity = Number(pantryItem?.quantity ?? 0);

    return Number.isFinite(quantity) ? quantity : 0;
}

export function isLowStock(item) {
    return (
        Number(item.quantity) <=
        Number(item.lowStockThreshold || 0)
    );
}

export function daysUntilExpiration(item) {
    if (!item?.expirationDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiration = new Date(item.expirationDate);
    expiration.setHours(0, 0, 0, 0);

    const differenceMs = expiration.getTime() - today.getTime();
    const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

    return Number.isFinite(differenceDays) ? differenceDays : null;
}

export function isExpiringSoon(item, days = 3) {
    const differenceDays = daysUntilExpiration(item);

    return differenceDays !== null && differenceDays >= 0 && differenceDays <= days;
}

export function getRecipeExpiringIngredients(recipe, pantry, days = 3) {
    return (recipe?.ingredients || [])
        .map((ingredient) => {
            const pantryItem = getPantryItemForIngredient(ingredient, pantry);
            const daysLeft = daysUntilExpiration(pantryItem);

            if (daysLeft === null || daysLeft < 0 || daysLeft > days) {
                return null;
            }

            return {
                name: pantryItem.name,
                expirationDate: pantryItem.expirationDate,
                daysLeft,
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.daysLeft - b.daysLeft);
}

export function getRecipeExpiryPriority(recipe, pantry, days = 3) {
    const expiringIngredients = getRecipeExpiringIngredients(recipe, pantry, days);

    return expiringIngredients.reduce((score, ingredient) => {
        return score + Math.max(1, days + 1 - ingredient.daysLeft);
    }, 0);
}

export function getMissingIngredients(
    recipe,
    pantry,
    portions = recipe?.basePortions || 1
) {
    const basePortions = Number(recipe?.basePortions || 1);
    const selectedPortions = Number(portions || basePortions);
    const multiplier = selectedPortions / basePortions;

    return (recipe?.ingredients || [])
        .map((ingredient) => {
            const required = getRequiredQuantity(ingredient) * multiplier;
            const available = getAvailableQuantity(ingredient, pantry);
            const missing = required - available;

            return {
                name: getIngredientName(ingredient),
                quantity:
                    missing > 0
                        ? Number(missing.toFixed(2))
                        : 0,
                unit: getIngredientUnit(ingredient),
            };
        })
        .filter((ingredient) => ingredient.quantity > 0);
}

export function getRecipeCoverage(recipe, pantry) {
    const ingredients = recipe?.ingredients || [];

    if (ingredients.length === 0) {
        return 0;
    }

    const missingCount = getMissingIngredients(
        recipe,
        pantry,
        recipe?.basePortions || 1
    ).length;

    return ((ingredients.length - missingCount) / ingredients.length) * 100;
}

export function calculateMaxPortions(recipe, pantry) {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
        return 0;
    }

    const possiblePortions = recipe.ingredients.map(
        (ingredient) => {
            const available = getAvailableQuantity(
                ingredient,
                pantry
            );

            const requiredPerBase =
                getRequiredQuantity(ingredient) /
                Number(recipe.basePortions || 1);

            if (requiredPerBase <= 0) {
                return Infinity;
            }

            return Math.floor(
                available / requiredPerBase
            );
        }
    );

    return Math.max(
        0,
        Math.min(...possiblePortions)
    );
}

export function getScaledIngredients(
    recipe,
    portions = 1
) {
    const multiplier =
        portions / (recipe.basePortions || 1);

    return (recipe.ingredients || []).map(
        (ingredient) => ({
            ...ingredient,
            name: getIngredientName(ingredient),
            unit: getIngredientUnit(ingredient),
            quantity: Number(
                (
                    getRequiredQuantity(ingredient) *
                    multiplier
                ).toFixed(2)
            ),
        })
    );
}
