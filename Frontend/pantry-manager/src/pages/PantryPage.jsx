import { useMemo, useState } from "react";
import Modal from "../components/Modal.jsx";
import ResponsiveTable from "../components/ResponsiveTable.jsx";
import { categories, units } from "../data/constants.js";
import { isExpiringSoon, isLowStock } from "../utils/pantryLogic.js";

const emptyItem = {
    name: "",
    quantity: "",
    unit: "g",
    category: "Other",
    expirationDate: "",
    isEssential: false,
    lowStockThreshold: "",
};

export default function PantryPage({
    pantry,
    selectedItemId,
    setSelectedItemId,
    onSaveItem,
    onDeleteItem,
}) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [modalMode, setModalMode] = useState(null);
    const [form, setForm] = useState(emptyItem);

    const selectedItem = pantry.find((item) => item.id === selectedItemId);

    const filteredItems = useMemo(() => {
        return pantry.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());

            const matchesFilter =
                filter === "All" ||
                (filter === "Low stock" && isLowStock(item)) ||
                (filter === "Expiring soon" && isExpiringSoon(item)) ||
                (filter === "Essential" && item.isEssential) ||
                item.category === filter;

            return matchesSearch && matchesFilter;
        });
    }, [pantry, search, filter]);

    function openAdd() {
        setForm(emptyItem);
        setModalMode("add");
    }

    function openEdit() {
    if (!selectedItem) return;
    setForm({
        ...selectedItem,
        expirationDate: selectedItem.expirationDate ? selectedItem.expirationDate.slice(0, 10) : "",
    });
    setModalMode("edit");
}

    function saveItem(event) {
    event.preventDefault();

    onSaveItem({
        ...form,
        quantity: Number(form.quantity),
        lowStockThreshold: Number(form.lowStockThreshold),
    });

    setModalMode(null);
}

    const columns = [
        { key: "name", label: "Product" },
        { key: "quantity", label: "Quantity" },
        { key: "unit", label: "Unit" },
        {
            key: "expirationDate",
            label: "Exp. Date",
            render: (item) => item.expirationDate ? item.expirationDate.slice(0, 10) : "—",
        },
        {
            key: "status",
            label: "Status",
            render: (item) => (
                <div className="status-list">
                    {isLowStock(item) && <span className="pill warning">Low</span>}
                    {isExpiringSoon(item) && <span className="pill danger">Expiring</span>}
                    {item.isEssential && <span className="pill olive">Essential</span>}
                </div>
            ),
        },
    ];

    return (
        <section className="page-card">
            <div className="page-title-row">
                <div>
                    <p className="eyebrow">Inventory dashboard</p>
                    <h1>My Pantry</h1>
                    <p className="muted">
                        Track products, quantities, units, and expiration dates.
                    </p>
                </div>

                <button className="primary-button" onClick={openAdd}>
                    + Add Ingredient
                </button>
            </div>

            <div className="toolbar">
                <input
                    className="search-input"
                    placeholder="Search ingredient..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />

                <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                    <option>All</option>
                    <option>Low stock</option>
                    <option>Expiring soon</option>
                    <option>Essential</option>
                    {categories.map((category) => (
                        <option key={category}>{category}</option>
                    ))}
                </select>
            </div>

            <ResponsiveTable
                columns={columns}
                rows={filteredItems}
                selectedId={selectedItemId}
                onRowClick={(item) => setSelectedItemId(item.id)}
            />

            <div className="action-bar">
                <button className="secondary-button" onClick={openEdit} disabled={!selectedItem}>
                    Edit Selected
                </button>

                <button
                    className="danger-button"
                    onClick={() => onDeleteItem(selectedItemId)}
                    disabled={!selectedItem}
                >
                    Delete Selected
                </button>
            </div>

            {modalMode && (
                <Modal
                    title={modalMode === "add" ? "Add Ingredient" : "Edit Ingredient"}
                    onClose={() => setModalMode(null)}
                >
                    <form className="form-grid" onSubmit={saveItem}>
                        <label>
                            Name
                            <input
                                required
                                value={form.name}
                                onChange={(event) => setForm({ ...form, name: event.target.value })}
                                placeholder="Enter name"
                            />
                        </label>

                        <label>
                            Quantity
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={form.quantity}
                                onChange={(event) =>
                                    setForm({ ...form, quantity: event.target.value })
                                }
                                placeholder="Enter quantity"
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

                        <label>
                            Category
                            <select
                                value={form.category}
                                onChange={(event) =>
                                    setForm({ ...form, category: event.target.value })
                                }
                            >
                                {categories.map((category) => (
                                    <option key={category}>{category}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Expiration Date
                            <input
                                type="date"
                                value={form.expirationDate}
                                onChange={(event) =>
                                    setForm({ ...form, expirationDate: event.target.value })
                                }
                            />
                        </label>

                        <label>
                            Low Stock Threshold
                            <input
                                required
                                type="number"
                                step="0.01"
                                value={form.lowStockThreshold}
                                onChange={(event) =>
                                    setForm({ ...form, lowStockThreshold: event.target.value })
                                }
                                placeholder="Example: 2"
                            />
                        </label>

                        <label className="checkbox-row">
                            <input
                                type="checkbox"
                                checked={form.isEssential}
                                onChange={(event) =>
                                    setForm({ ...form, isEssential: event.target.checked })
                                }
                            />
                            Essential item
                        </label>

                        <button className="primary-button form-submit" type="submit">
                            Save
                        </button>
                    </form>
                </Modal>
            )}
        </section>
    );
}