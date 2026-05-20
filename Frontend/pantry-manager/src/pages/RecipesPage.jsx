import { useMemo, useState } from "react";
import Modal from "../components/Modal.jsx";
import ResponsiveTable from "../components/ResponsiveTable.jsx";
import { diets, units } from "../data/mockData.js";

const emptyRecipe = {
    name: "",
    caloriesPerPortion: "",
    basePortions: "",
    diet: "None",
    allergens: "",
    ingredients: [],
    instructions: "",
};

const emptyIngredient = {
    name: "",
    quantity: "",
    unit: "g",
};

export default function RecipesPage({
    recipes,
    pantry,
    selectedRecipeId,
    setSelectedRecipeId,
    setPage,
    onSaveRecipe,
    onDeleteRecipe,
}) {
    const [search, setSearch] = useState("");
    const [activeDiets, setActiveDiets] = useState([]);
    const [modalMode, setModalMode] = useState(null);
    const [form, setForm] = useState(emptyRecipe);
    const [ingredientForm, setIngredientForm] = useState(emptyIngredient);

    const selectedRecipe = recipes.find((recipe) => recipe.id === selectedRecipeId);

    const filteredRecipes = useMemo(() => {
        return recipes.filter((recipe) => {
            const matchesSearch = recipe.name.toLowerCase().includes(search.toLowerCase());
            const matchesDiet =
                activeDiets.length === 0 || activeDiets.includes(recipe.diet);

            return matchesSearch && matchesDiet;
        });
    }, [recipes, search, activeDiets]);

    function toggleDiet(diet) {
        setActiveDiets((current) =>
            current.includes(diet)
                ? current.filter((item) => item !== diet)
                : [...current, diet]
        );
    }

    function openAdd() {
        setForm(emptyRecipe);
        setIngredientForm(emptyIngredient);
        setModalMode("add");
    }

    function openEdit() {
        if (!selectedRecipe) return;
        setForm(selectedRecipe);
        setIngredientForm(emptyIngredient);
        setModalMode("edit");
    }

    function addIngredient() {
        if (!ingredientForm.name || !ingredientForm.quantity) return;

        setForm({
            ...form,
            ingredients: [
                ...form.ingredients,
                {
                    id: Date.now(),
                    name: ingredientForm.name,
                    quantity: Number(ingredientForm.quantity),
                    unit: ingredientForm.unit,
                },
            ],
        });

        setIngredientForm(emptyIngredient);
    }

    function removeIngredient(id) {
        setForm({
            ...form,
            ingredients: form.ingredients.filter((ingredient) => ingredient.id !== id),
        });
    }

    function saveRecipe(event) {
        event.preventDefault();

        onSaveRecipe({
            ...form,
            id: form.id ?? Date.now(),
            caloriesPerPortion: Number(form.caloriesPerPortion),
            basePortions: Number(form.basePortions),
        });

        setModalMode(null);
    }

    const columns = [
        { key: "name", label: "Recipe" },
        { key: "caloriesPerPortion", label: "Calories" },
        { key: "basePortions", label: "Portions" },
        {
            key: "diet",
            label: "Diet",
            render: (recipe) => <span className="pill olive">{recipe.diet}</span>,
        },
        {
            key: "allergens",
            label: "Allergens",
            render: (recipe) => recipe.allergens || "—",
        },
    ];

    return (
        <section className="page-card">
            <div className="page-title-row">
                <div>
                    <p className="eyebrow">Recipe catalog</p>
                    <h1>My Recipes</h1>
                    <p className="muted">
                        Browse, filter, view, add, and edit recipes.
                    </p>
                </div>

                <button className="primary-button" onClick={openAdd}>
                    + Add Recipe
                </button>
            </div>

            <div className="toolbar recipe-toolbar">
                <input
                    className="search-input"
                    placeholder="Search recipe..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />

                <div className="filter-checks">
                    {diets.map((diet) => (
                        <label key={diet}>
                            <input
                                type="checkbox"
                                checked={activeDiets.includes(diet)}
                                onChange={() => toggleDiet(diet)}
                            />
                            {diet}
                        </label>
                    ))}
                </div>
            </div>

            <ResponsiveTable
                columns={columns}
                rows={filteredRecipes}
                selectedId={selectedRecipeId}
                onRowClick={(recipe) => setSelectedRecipeId(recipe.id)}
            />

            <div className="action-bar">
                <button
                    className="primary-button"
                    onClick={() => setPage("recipeDetail")}
                    disabled={!selectedRecipe}
                >
                    View Selected
                </button>

                <button className="secondary-button" onClick={openEdit} disabled={!selectedRecipe}>
                    Edit Selected
                </button>

                <button
                    className="danger-button"
                    onClick={() => onDeleteRecipe(selectedRecipeId)}
                    disabled={!selectedRecipe}
                >
                    Delete Selected
                </button>
            </div>

            {modalMode && (
                <Modal
                    title={modalMode === "add" ? "Add Recipe" : "Edit Recipe"}
                    onClose={() => setModalMode(null)}
                >
                    <form className="recipe-form" onSubmit={saveRecipe}>
                        <div className="form-grid">
                            <label>
                                Name
                                <input
                                    required
                                    value={form.name}
                                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                                    placeholder="Enter recipe name"
                                />
                            </label>

                            <label>
                                Calories per portion
                                <input
                                    required
                                    type="number"
                                    value={form.caloriesPerPortion}
                                    onChange={(event) =>
                                        setForm({ ...form, caloriesPerPortion: event.target.value })
                                    }
                                    placeholder="Example: 750"
                                />
                            </label>

                            <label>
                                Base portions
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={form.basePortions}
                                    onChange={(event) =>
                                        setForm({ ...form, basePortions: event.target.value })
                                    }
                                    placeholder="Example: 3"
                                />
                            </label>

                            <label>
                                Diet
                                <select
                                    value={form.diet}
                                    onChange={(event) => setForm({ ...form, diet: event.target.value })}
                                >
                                    {diets.map((diet) => (
                                        <option key={diet}>{diet}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="wide">
                                Allergens
                                <input
                                    value={form.allergens}
                                    onChange={(event) =>
                                        setForm({ ...form, allergens: event.target.value })
                                    }
                                    placeholder="Eggs, Dairy, Gluten"
                                />
                            </label>
                        </div>

                        <div className="mini-card">
                            <h3>Add Ingredient</h3>

                            <div className="ingredient-row">
                                <input
                                    list="pantry-names"
                                    placeholder="Ingredient name"
                                    value={ingredientForm.name}
                                    onChange={(event) =>
                                        setIngredientForm({
                                            ...ingredientForm,
                                            name: event.target.value,
                                        })
                                    }
                                />

                                <datalist id="pantry-names">
                                    {pantry.map((item) => (
                                        <option key={item.id} value={item.name} />
                                    ))}
                                </datalist>

                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Qty"
                                    value={ingredientForm.quantity}
                                    onChange={(event) =>
                                        setIngredientForm({
                                            ...ingredientForm,
                                            quantity: event.target.value,
                                        })
                                    }
                                />

                                <select
                                    value={ingredientForm.unit}
                                    onChange={(event) =>
                                        setIngredientForm({
                                            ...ingredientForm,
                                            unit: event.target.value,
                                        })
                                    }
                                >
                                    {units.map((unit) => (
                                        <option key={unit}>{unit}</option>
                                    ))}
                                </select>

                                <button type="button" className="secondary-button" onClick={addIngredient}>
                                    Add
                                </button>
                            </div>

                            <div className="ingredient-list">
                                {form.ingredients.map((ingredient) => (
                                    <span className="ingredient-chip" key={ingredient.id}>
                                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                                        <button type="button" onClick={() => removeIngredient(ingredient.id)}>
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <label className="instructions-label">
                            Instructions
                            <textarea
                                required
                                value={form.instructions}
                                onChange={(event) =>
                                    setForm({ ...form, instructions: event.target.value })
                                }
                                placeholder="Enter cooking steps..."
                            />
                        </label>

                        <button className="primary-button form-submit" type="submit">
                            Save Recipe
                        </button>
                    </form>
                </Modal>
            )}
        </section>
    );
}