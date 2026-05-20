import { useMemo, useState } from "react";
import ResponsiveTable from "../components/ResponsiveTable.jsx";
import {
    canCookRecipe,
    getMissingIngredients,
} from "../utils/pantryLogic.js";

export default function SuggestionsPage({
    recipes,
    pantry,
    setSelectedRecipeId,
    setPage,
    onCookRecipe,
    onAddMissingToShopping,
}) {
    const [selectedId, setSelectedId] = useState(recipes[0]?.id ?? null);

    const suggestions = useMemo(() => {
        return recipes.map((recipe) => {
            const missing = getMissingIngredients(recipe, pantry, recipe.basePortions);

            return {
                ...recipe,
                missing,
                canCook: canCookRecipe(recipe, pantry, recipe.basePortions),
            };
        });
    }, [recipes, pantry]);

    const selectedSuggestion = suggestions.find((item) => item.id === selectedId);

    const columns = [
        { key: "name", label: "Recipe" },
        {
            key: "missing",
            label: "Missing Ingredients",
            render: (recipe) =>
                recipe.missing.length === 0 ? (
                    <span className="pill olive">None</span>
                ) : (
                    <div className="status-list">
                        {recipe.missing.map((item) => (
                            <span className="pill warning" key={item.ingredientName}>
                                {item.ingredientName}: {item.quantityNeeded} {item.unit}
                            </span>
                        ))}
                    </div>
                ),
        },
        {
            key: "canCook",
            label: "Can Cook?",
            render: (recipe) =>
                recipe.canCook ? (
                    <span className="pill olive">Yes</span>
                ) : (
                    <span className="pill danger">No</span>
                ),
        },
    ];

    function openRecipe(recipe) {
        setSelectedRecipeId(recipe.id);
        setPage("recipeDetail");
    }

    return (
        <section className="page-card">
            <div className="page-title-row">
                <div>
                    <p className="eyebrow">Suggestion hub</p>
                    <h1>Suggestions</h1>
                    <p className="muted">
                        Recipes are checked against your current inventory.
                    </p>
                </div>
            </div>

            <ResponsiveTable
                columns={columns}
                rows={suggestions}
                selectedId={selectedId}
                onRowClick={(recipe) => setSelectedId(recipe.id)}
            />

            <div className="action-bar">
                <button
                    className="primary-button"
                    disabled={!selectedSuggestion}
                    onClick={() => openRecipe(selectedSuggestion)}
                >
                    View Recipe
                </button>

                <button
                    className="secondary-button"
                    disabled={!selectedSuggestion || !selectedSuggestion.canCook}
                    onClick={() =>
                        onCookRecipe(selectedSuggestion.id, selectedSuggestion.basePortions)
                    }
                >
                    Cook Selected
                </button>

                <button
                    className="secondary-button"
                    disabled={!selectedSuggestion || selectedSuggestion.missing.length === 0}
                    onClick={() => onAddMissingToShopping(selectedSuggestion.missing)}
                >
                    Add Missing to Shopping List
                </button>
            </div>
        </section>
    );
}