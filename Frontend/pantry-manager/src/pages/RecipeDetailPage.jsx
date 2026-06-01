import { useMemo, useState } from "react";
import ResponsiveTable from "../components/ResponsiveTable.jsx";
import {
    calculateMaxPortions,
    getScaledIngredients,
} from "../utils/pantryLogic.js";

export default function RecipeDetailPage({ recipe, pantry, setPage, onCookRecipe }) {
    const maxPortions = useMemo(
        () => calculateMaxPortions(recipe, pantry),
        [recipe, pantry]
    );

    const [portions, setPortions] = useState(1);

    const scaledIngredients = getScaledIngredients(recipe, portions);

    const portionOptions = Array.from(
        { length: Math.max(1, Math.min(6, maxPortions || recipe.basePortions)) },
        (_, index) => index + 1
    );

    const columns = [
        { key: "name", label: "Ingredient" },
        { key: "quantity", label: "Quantity" },
        { key: "unit", label: "Unit" },
    ];

    return (
        <section className="page-card recipe-detail">
            <button className="ghost-button" onClick={() => setPage("recipes")}>
                ← Back to recipes
            </button>

            <div className="detail-hero">
                <div>
                    <p className="eyebrow">Recipe page</p>
                    <h1>{recipe.name}</h1>

                    <div className="detail-meta">
                        <span>{recipe.caloriesPerPortion} kcal / portion</span>
                        <span>Base: {recipe.basePortions} portions</span>
                        <span>{recipe.diet}</span>
                    </div>

                    <p className="muted">
                        Allergens: {recipe.allergens || "No allergens specified"}
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={() => onCookRecipe(recipe.id, portions)}
                >
                    Cook {portions} portion{portions > 1 ? "s" : ""}
                </button>
            </div>

            <div className="portion-picker">
                <span>Choose portions:</span>
                {portionOptions.map((option) => (
                    <button
                        key={option}
                        className={portions === option ? "active" : ""}
                        onClick={() => setPortions(option)}
                    >
                        {option}x
                    </button>
                ))}
                <small>Max possible from pantry: {maxPortions}</small>
            </div>

            <h2>Ingredients</h2>

            <ResponsiveTable columns={columns} rows={scaledIngredients} />

            <h2>Instructions</h2>

            <div className="instructions-box">
                {(recipe.instructions ?? "").split(".").map((step, index) => {
                    const text = step.trim();
                    if (!text) return null;

                    return (
                        <p key={index}>
                            <strong>{index + 1}.</strong> {text}.
                        </p>
                    );
                })}
            </div>
        </section>
    );
}