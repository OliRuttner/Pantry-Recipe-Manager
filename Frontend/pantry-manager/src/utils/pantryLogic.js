export function normalize(value) {
    return value.trim().toLowerCase();
}

export function isLowStock(item) {
    return Number(item.quantity) <= Number(item.lowStockThreshold);
}

export function isExpiringSoon(item, days = 14) {
    if (!item.expirationDate) return false;

    const today = new Date();
    const exp = new Date(item.expirationDate);
    const difference = exp.getTime() - today.getTime();
    const daysLeft = difference / (1000 * 60 * 60 * 24);

    return daysLeft >= 0 && daysLeft <= days;
}

export function findPantryItem(pantry, ingredientName) {
    return pantry.find((item) => normalize(item.name) === normalize(ingredientName));
}

export function getScaledIngredients(recipe, portions) {
    const multiplier = portions / recipe.basePortions;

    return recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        quantity: Number((ingredient.quantity * multiplier).toFixed(2)),
    }));
}

export function getMissingIngredients(recipe, pantry, portions = recipe.basePortions) {
    const scaledIngredients = getScaledIngredients(recipe, portions);

    return scaledIngredients
        .map((ingredient) => {
            const pantryItem = findPantryItem(pantry, ingredient.name);

            if (!pantryItem || pantryItem.unit !== ingredient.unit) {
                return {
                    ingredientName: ingredient.name,
                    quantityNeeded: ingredient.quantity,
                    unit: ingredient.unit,
                };
            }

            const missingQuantity = ingredient.quantity - pantryItem.quantity;

            if (missingQuantity <= 0) return null;

            return {
                ingredientName: ingredient.name,
                quantityNeeded: Number(missingQuantity.toFixed(2)),
                unit: ingredient.unit,
            };
        })
        .filter(Boolean);
}

export function canCookRecipe(recipe, pantry, portions = recipe.basePortions) {
    return getMissingIngredients(recipe, pantry, portions).length === 0;
}

export function deductInventory(pantry, recipe, portions = recipe.basePortions) {
    const scaledIngredients = getScaledIngredients(recipe, portions);

    return pantry.map((item) => {
        const used = scaledIngredients.find(
            (ingredient) => normalize(ingredient.name) === normalize(item.name)
        );

        if (!used || used.unit !== item.unit) return item;

        return {
            ...item,
            quantity: Number(Math.max(0, item.quantity - used.quantity).toFixed(2)),
        };
    });
}

export function calculateMaxPortions(recipe, pantry) {
    const possiblePortions = recipe.ingredients.map((ingredient) => {
        const pantryItem = findPantryItem(pantry, ingredient.name);

        if (!pantryItem || pantryItem.unit !== ingredient.unit) return 0;

        const amountPerPortion = ingredient.quantity / recipe.basePortions;

        if (amountPerPortion <= 0) return 0;

        return Math.floor(pantryItem.quantity / amountPerPortion);
    });

    return Math.max(0, Math.min(...possiblePortions));
}

export function mergeShoppingItems(oldList, missingItems) {
    const nextList = [...oldList];

    missingItems.forEach((missing) => {
        const existing = nextList.find(
            (item) =>
                normalize(item.ingredientName) === normalize(missing.ingredientName) &&
                item.unit === missing.unit &&
                !item.isBought
        );

        if (existing) {
            existing.quantityNeeded = Number(
                (existing.quantityNeeded + missing.quantityNeeded).toFixed(2)
            );
        } else {
            nextList.push({
                id: Date.now() + Math.random(),
                ingredientName: missing.ingredientName,
                quantityNeeded: missing.quantityNeeded,
                unit: missing.unit,
                isBought: false,
            });
        }
    });

    return nextList;
}