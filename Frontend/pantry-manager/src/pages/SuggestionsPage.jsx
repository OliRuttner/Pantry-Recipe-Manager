import { useEffect, useMemo, useState } from "react";
import {
    getMissingIngredients,
    getRecipeCoverage,
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
            }))
            .sort((a, b) => b.coverage - a.coverage);
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
        if (!selectedSuggestion) return;

        await onCookRecipe(selectedSuggestion.recipe.id, 1);
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
        <section className="page-card">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">Recommendations</p>
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
                            </div>

                            <span
                                className={`status-pill ${
                                    suggestion.coverage === 100
                                        ? "status-good"
                                        : "status-warning"
                                }`}
                            >
                                {suggestion.coverage === 100
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

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={handleAddMissing}
                                disabled={
                                    selectedSuggestion.missing.length === 0
                                }
                            >
                                Add Missing to Shopping List
                            </button>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={handleCook}
                            >
                                Cook Recipe
                            </button>
                        </div>
                    </article>
                )}
            </div>
        </section>
    );
}