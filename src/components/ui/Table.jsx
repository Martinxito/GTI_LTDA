import React from 'react';

const Table = ({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = 'No hay datos disponibles',
  className = '',
  ...props 
}) => {
  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--border-radius)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  };

  const headerStyles = {
    backgroundColor: 'var(--bg-tertiary)',
    borderBottom: '1px solid var(--border-color)',
  };

  const headerCellStyles = {
    padding: 'var(--spacing-md) var(--spacing-lg)',
    textAlign: 'left',
    fontSize: 'var(--font-size-sm)',
    fontWeight: '600',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-color)',
  };

  const cellStyles = {
    padding: 'var(--spacing-md) var(--spacing-lg)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-color)',
  };

  const rowStyles = {
    transition: 'var(--transition-fast)',
    '&:hover': {
      backgroundColor: 'var(--bg-secondary)',
    },
  };

  const loadingStyles = {
    padding: 'var(--spacing-2xl)',
    textAlign: 'center',
    color: 'var(--text-secondary)',
  };

  const emptyStyles = {
    padding: 'var(--spacing-2xl)',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  };

  if (loading) {
    return (
      <div style={loadingStyles}>
        <div style={{
          display: 'inline-block',
          width: '2rem',
          height: '2rem',
          border: '3px solid var(--border-color)',
          borderTop: '3px solid var(--primary-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 'var(--spacing-md)',
        }} />
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyles} className={className} {...props}>
        <thead style={headerStyles}>
          <tr>
            {columns.map((column, index) => {
              const headerLabel = column.header ?? column.label ?? column.key;
              return (
                <th key={index} style={headerCellStyles}>
                  {headerLabel}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={emptyStyles}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} style={rowStyles}>
                {columns.map((column, colIndex) => {
                  const cellContent = column.render
                    ? column.render(row, column)
                    : row?.[column.key];
                  return (
                    <td key={colIndex} style={cellStyles}>
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
