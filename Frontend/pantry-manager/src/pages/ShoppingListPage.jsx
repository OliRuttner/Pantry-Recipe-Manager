import ResponsiveTable from "../components/ResponsiveTable.jsx";

export default function ShoppingListPage({
    shoppingList,
    onToggleBought,
    onClearBought,
    onClearAll,
}) {
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
            </div>

            <ResponsiveTable
                columns={columns}
                rows={shoppingList}
                emptyText="Your shopping list is empty."
            />

            <div className="action-bar">
                <button className="secondary-button" onClick={onClearBought}>
                    Clear Bought
                </button>

                <button className="danger-button" onClick={onClearAll}>
                    Clear All
                </button>
            </div>
        </section>
    );
}