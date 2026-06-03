import { useEffect, useMemo, useState } from "react";
import {
    getMissingIngredients,
    getRecipeCoverage,
    getRecipeExpiringIngredients,
    getRecipeExpiryPriority,
} from "../utils/pantryLogic.js";

export default function SuggestionsPage({
    recipes,
    pantry,
    setSelectedRecipeId,
    setPage,
    onCookRecipe,
    onAddMissingToShopping,
}) {
    const [selectedId, setSelectedId] = useState(null);
    const [cookState, setCookState] = useState("idle");

    useEffect(() => {
        if (!selectedId && recipes.length > 0) {
            setSelectedId(recipes[0].id);
        }
    }, [recipes, selectedId]);

    const suggestions = useMemo(() => {
        return recipes
            .map((recipe) => ({
                recipe,
                coverage: getRecipeCoverage(recipe, pantry),
                missing: getMissingIngredients(recipe, pantry),
                expiringIngredients: getRecipeExpiringIngredients(recipe, pantry),
                expiryPriority: getRecipeExpiryPriority(recipe, pantry),
            }))
            .sort((a, b) => {
                const readyDifference =
                    Number(b.missing.length === 0) - Number(a.missing.length === 0);

                if (readyDifference !== 0) return readyDifference;

                if (b.expiryPriority !== a.expiryPriority) {
                    return b.expiryPriority - a.expiryPriority;
                }

                return b.coverage - a.coverage;
            });
    }, [recipes, pantry]);

    const selectedSuggestion =
        suggestions.find(
            (suggestion) => suggestion.recipe.id === selectedId
        ) ?? suggestions[0];

    function openRecipe(recipeId) {
        setSelectedRecipeId(recipeId);
        setPage("recipeDetail");
    }

    async function handleCook() {
        if (!selectedSuggestion || cookState !== "idle") return;
        if (selectedSuggestion.missing.length > 0) return;

        setCookState("cooking");

        try {
            const result = await onCookRecipe(selectedSuggestion.recipe.id, 1, {
                redirect: false,
            });

            if (result?.redirectedToShopping) return;

            setCookState("done");

            window.setTimeout(() => {
                setPage("pantry");
            }, 950);
        } catch {
            setCookState("idle");
        }
    }

    async function handleAddMissing() {
        if (!selectedSuggestion || selectedSuggestion.missing.length === 0)
            return;

        await onAddMissingToShopping(
            selectedSuggestion.missing.map((item) => ({
                ingredientName: item.name,
                quantityNeeded: item.quantity,
                unit: item.unit,
            }))
        );
    }

    return (
        <section className="page-card suggestions-page">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">Recipe Matches</p>
                    <h1>What can you cook today?</h1>
                </div>
            </div>

            <div className="suggestions-layout">
                <aside className="suggestions-sidebar">
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion.recipe.id}
                            type="button"
                            className={`suggestion-card ${
                                selectedSuggestion?.recipe.id ===
                                suggestion.recipe.id
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setSelectedId(suggestion.recipe.id)
                            }
                        >
                            <div>
                                <h3>{suggestion.recipe.name}</h3>
                                <p>
                                    {Math.round(suggestion.coverage)}% pantry
                                    match
                                </p>
                                {suggestion.expiringIngredients.length > 0 && (
                                    <span className="expiry-priority-note">
                                        Use soon: {suggestion.expiringIngredients
                                            .slice(0, 2)
                                            .map((item) => item.name)
                                            .join(", ")}
                                    </span>
                                )}
                            </div>

                            <span
                                className={`status-pill ${
                                    suggestion.missing.length === 0
                                        ? "status-good"
                                        : "status-warning"
                                }`}
                            >
                                {suggestion.missing.length === 0
                                    ? "Ready"
                                    : `${suggestion.missing.length} missing`}
                            </span>
                        </button>
                    ))}
                </aside>

                {selectedSuggestion && (
                    <article className="recipe-preview">
                        <div className="preview-header">
                            <div>
                                <p className="eyebrow">
                                    Suggested Recipe
                                </p>
                                <h2>{selectedSuggestion.recipe.name}</h2>
                            </div>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    openRecipe(
                                        selectedSuggestion.recipe.id
                                    )
                                }
                            >
                                Open Recipe
                            </button>
                        </div>

                        <div className="preview-grid">
                            <div className="metric-card">
                                <span>Coverage</span>
                                <strong>
                                    {Math.round(
                                        selectedSuggestion.coverage
                                    )}
                                    %
                                </strong>
                            </div>

                            <div className="metric-card">
                                <span>Calories</span>
                                <strong>
                                    {
                                        selectedSuggestion.recipe
                                            .caloriesPerPortion
                                    }
                                </strong>
                            </div>

                            <div className="metric-card">
                                <span>Base Portions</span>
                                <strong>
                                    {
                                        selectedSuggestion.recipe
                                            .basePortions
                                    }
                                </strong>
                            </div>

            
                        </div>

                        <div className="preview-section">
                            <h3>Expiring Soon Priority</h3>

                            {selectedSuggestion.expiringIngredients.length === 0 ? (
                                <p className="muted-text">
                                    No recipe ingredients are expiring in the next 3 days.
                                </p>
                            ) : (
                                <ul className="expiry-list">
                                    {selectedSuggestion.expiringIngredients.map((item) => (
                                        <li key={item.name}>
                                            <strong>{item.name}</strong>
                                            <span>
                                                {item.daysLeft === 0
                                                    ? "expires today"
                                                    : `expires in ${item.daysLeft} day${
                                                          item.daysLeft === 1 ? "" : "s"
                                                      }`}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="preview-section">
                            <h3>Missing Ingredients</h3>

                            {selectedSuggestion.missing.length === 0 ? (
                                <p className="muted-text">
                                    You have everything you need.
                                </p>
                            ) : (
                                <ul className="missing-list">
                                    {selectedSuggestion.missing.map(
                                        (item) => (
                                            <li key={item.name}>
                                                {item.name} —{" "}
                                                {item.quantity}{" "}
                                                {item.unit}
                                            </li>
                                        )
                                    )}
                                </ul>
                            )}
                        </div>

                        <div className="modal-actions suggestions-actions">
    {selectedSuggestion.missing.length === 0 ? (
        <button
            type="button"
            className={`primary-button cook-button ${
                cookState !== "idle" ? "is-cooking" : ""
            }`}
            onClick={handleCook}
            disabled={cookState !== "idle"}
        >
            {cookState === "idle"
                ? "Cook Recipe"
                : cookState === "cooking"
                    ? "Cooking..."
                    : "Cooked!"}
        </button>
    ) : (
        <button
            type="button"
            className="secondary-button"
            onClick={handleAddMissing}
        >
            Add Missing to Shopping List
        </button>
    )}
</div>
                    </article>
                )}
            </div>

            {cookState !== "idle" && (
                <div className="cook-toast" role="status" aria-live="polite">
                    <div className="cook-pan">✓</div>
                    <div>
                        <strong>
                            {cookState === "cooking"
                                ? "Cooking your recipe..."
                                : "Recipe cooked!"}
                        </strong>
                        <p>
                            {cookState === "cooking"
                                ? "Updating your pantry ingredients."
                                : "Pantry updated. Redirecting now."}
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}