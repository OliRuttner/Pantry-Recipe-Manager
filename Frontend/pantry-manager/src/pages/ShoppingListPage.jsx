import { useState } from "react";
import Modal from "../components/Modal.jsx";
import ResponsiveTable from "../components/ResponsiveTable.jsx";
import { units } from "../data/constants.js";

const emptyShoppingItem = {
    ingredientName: "",
    quantityNeeded: "",
    unit: "g",
};

export default function ShoppingListPage({
    shoppingList,
    onToggleBought,
    onCheckoutBought,
    onClearAll,
    onAddShoppingItem,
}) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [form, setForm] = useState(emptyShoppingItem);

    const columns = [
        { key: "ingredientName", label: "Ingredient" },
        { key: "quantityNeeded", label: "Qty Needed" },
        { key: "unit", label: "Unit" },
        {
            key: "isBought",
            label: "Bought?",
            render: (item) => (
                <label className="table-check">
                    <input
                        type="checkbox"
                        checked={item.isBought}
                        onChange={() => onToggleBought(item.id)}
                    />
                    {item.isBought ? "Bought" : "Not yet"}
                </label>
            ),
        },
    ];

    async function saveShoppingItem(event) {
        event.preventDefault();

        const duplicate = shoppingList.some((item) =>
            item.ingredientName.trim().toLowerCase() === form.ingredientName.trim().toLowerCase() &&
            item.unit === form.unit
        );

        if (duplicate) {
            alert("This ingredient is already in the shopping list.");
            return;
        }

        await onAddShoppingItem({
            ingredientName: form.ingredientName.trim(),
            quantityNeeded: Number(form.quantityNeeded),
            unit: form.unit,
        });

        setForm(emptyShoppingItem);
        setIsAddOpen(false);
    }

    return (
        <section className="page-card">
            <div className="page-title-row">
                <div>
                    <p className="eyebrow">Automated shopping list</p>
                    <h1>Missing Ingredients</h1>
                    <p className="muted">
                        Ingredients missing from recipe suggestions appear here.
                    </p>
                </div>

                <button className="primary-button" onClick={() => setIsAddOpen(true)}>
                    + Add Ingredient
                </button>
            </div>

            <ResponsiveTable
                columns={columns}
                rows={shoppingList}
                emptyText="Your shopping list is empty."
            />

            <div className="action-bar">
                <button
                    className="primary-button"
                    onClick={onCheckoutBought}
                    disabled={!shoppingList.some((item) => item.isBought)}
                >
                    Add Bought to Pantry
                </button>

                <button className="danger-button" onClick={onClearAll}>
                    Clear All
                </button>
            </div>

            {isAddOpen && (
                <Modal title="Add Ingredient to Shopping List" onClose={() => setIsAddOpen(false)}>
                    <form className="form-grid" onSubmit={saveShoppingItem}>
                        <label>
                            Ingredient name
                            <input
                                required
                                value={form.ingredientName}
                                onChange={(event) =>
                                    setForm({ ...form, ingredientName: event.target.value })
                                }
                                placeholder="Example: Milk"
                            />
                        </label>

                        <label>
                            Quantity
                            <input
                                required
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={form.quantityNeeded}
                                onChange={(event) =>
                                    setForm({ ...form, quantityNeeded: event.target.value })
                                }
                                placeholder="Example: 2"
                            />
                        </label>

                        <label>
                            Unit
                            <select
                                value={form.unit}
                                onChange={(event) => setForm({ ...form, unit: event.target.value })}
                            >
                                {units.map((unit) => (
                                    <option key={unit}>{unit}</option>
                                ))}
                            </select>
                        </label>

                        <button className="primary-button form-submit" type="submit">
                            Add to Shopping List
                        </button>
                    </form>
                </Modal>
            )}
        </section>
    );
}
