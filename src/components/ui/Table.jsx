const Table = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  className = '',
  ...props
}) => {
  const tableClassName = ['data-table', className].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className="data-table__loading" role="status" aria-live="polite">
        <span className="data-table__spinner" aria-hidden="true" />
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="data-table__container">
      <table className={tableClassName} {...props}>
        <thead>
          <tr>
            {columns.map((column, index) => {
              const headerLabel = column.header ?? column.label ?? column.key;
              return (
                <th key={index}>
                  {headerLabel}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="data-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => {
                  const cellContent = column.render
                    ? column.render(row, column)
                    : row?.[column.key];
                  return (
                    <td key={colIndex}>
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
