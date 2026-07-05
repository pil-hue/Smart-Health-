import React, { useState } from 'react';

/**
 * Reusable, responsive table component with client-side searching.
 */
const DataTable = ({ 
  title, 
  columns, 
  data = [], 
  searchPlaceholder = 'Search records...', 
  searchKeys = [], 
  onRowClick 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data based on search query
  const filteredData = data.filter((row) => {
    if (!searchQuery || searchKeys.length === 0) return true;
    
    return searchKeys.some((key) => {
      const value = row[key];
      if (value === undefined || value === null) return false;
      return String(value).toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  return (
    <div className="table-card">
      <div className="table-card-header">
        {title && <h2>{title}</h2>}
        {searchKeys.length > 0 && (
          <input
            type="text"
            className="table-search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={col.style}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIdx) => (
                <tr 
                  key={row.id || rowIdx}
                  className={onRowClick ? 'clickable' : ''}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} style={col.style}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
