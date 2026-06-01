export function getAvailableQuantity(itemName, pantry) {
    const pantryItem = pantry.find(
        (item) =>
            item.name.trim().toLowerCase() ===
            itemName.trim().toLowerCase()
    );

    return pantryItem ? Number(pantryItem.quantity) : 0;
}

export function isLowStock(item) {
    return (
        Number(item.quantity) <=
        Number(item.lowStockThreshold || 0)
    );
}

export function isExpiringSoon(item, days = 3) {
    if (!item.expirationDate) return false;

    const today = new Date();
    const expiration = new Date(item.expirationDate);

    const differenceMs =
        expiration.getTime() - today.getTime();

    const differenceDays =
        differenceMs / (1000 * 60 * 60 * 24);

    return differenceDays >= 0 && differenceDays <= days;
}

export function getMissingIngredients(
    recipe,
    pantry,
    portions = 1
) {
    const multiplier =
        portions / (recipe.basePortions || 1);

    return (recipe.ingredients || [])
        .map((ingredient) => {
            const available = getAvailableQuantity(
                ingredient.name,
                pantry
            );

            const required =
                Number(ingredient.quantity) * multiplier;

            const missing = required - available;

            return {
                name: ingredient.name,
                quantity:
                    missing > 0
                        ? Number(missing.toFixed(2))
                        : 0,
                unit: ingredient.unit,
            };
        })
        .filter((ingredient) => ingredient.quantity > 0);
}

export function getRecipeCoverage(recipe, pantry) {
    if (
        !recipe.ingredients ||
        recipe.ingredients.length === 0
    ) {
        return 0;
    }

    const availableCount =
        recipe.ingredients.filter(
            (ingredient) =>
                getAvailableQuantity(
                    ingredient.name,
                    pantry
                ) >= Number(ingredient.quantity)
        ).length;

    return (
        (availableCount /
            recipe.ingredients.length) *
        100
    );
}
export function calculateMaxPortions(recipe, pantry) {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
        return 0;
    }

    const possiblePortions = recipe.ingredients.map(
        (ingredient) => {
            const available = getAvailableQuantity(
                ingredient.name,
                pantry
            );

            const requiredPerBase =
                Number(ingredient.quantity) /
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
            quantity: Number(
                (
                    Number(ingredient.quantity) *
                    multiplier
                ).toFixed(2)
            ),
        })
    );
}