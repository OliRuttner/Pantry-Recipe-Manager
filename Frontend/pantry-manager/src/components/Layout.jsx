import CookieScroll from "./CookieScroll.jsx";

export default function Layout({ page, setPage, children }) {
    const navItems = [
        { id: "pantry", label: "Pantry" },
        { id: "recipes", label: "Recipes" },
        { id: "suggestions", label: "Suggestions" },
        { id: "shopping", label: "Shopping List" },
    ];

    return (
        <div className="app-shell">
            <header className="topbar">
                <button className="brand" onClick={() => setPage("pantry")}>
                    <img
                        src="/logo.png"
                        alt="C-Sharp Cheddar logo"
                        className="brand-logo"
                    />

                    <span className="brand-text">
                        <strong>C-Sharp Cheddar</strong>
                        <small>Pantry Manager</small>
                    </span>
                </button>

                <nav className="nav-tabs">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={page === item.id ? "active" : ""}
                            onClick={() => setPage(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </header>

            <main className="page-wrap">{children}</main>

            <CookieScroll />
        </div>
    );
}