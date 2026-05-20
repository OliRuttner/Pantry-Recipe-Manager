export default function ResponsiveTable({
    columns,
    rows,
    selectedId,
    onRowClick,
    emptyText = "No data found.",
}) {
    if (rows.length === 0) {
        return <div className="empty-box">{emptyText}</div>;
    }

    return (
        <div className="table-scroll">
            <table className="responsive-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key}>{column.label}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={row.id}
                            className={selectedId === row.id ? "selected-row" : ""}
                            onClick={() => onRowClick?.(row)}
                        >
                            {columns.map((column) => (
                                <td key={column.key} data-label={column.label}>
                                    {column.render ? column.render(row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}