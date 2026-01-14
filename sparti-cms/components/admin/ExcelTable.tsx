import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ColumnDef<T> {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'boolean';
  width?: string;
  readonly?: boolean | ((row: T) => boolean);
  format?: (value: any, row: T) => string;
  parse?: (value: string, row: T) => any;
  validate?: (value: any, row: T) => string | null;
  render?: (value: any, row: T, isEditing: boolean) => React.ReactNode;
}

export interface ExcelTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onDataChange: (data: T[]) => void;
  onRowAdd?: () => T;
  onRowDelete?: (rowIndex: number) => void;
  readonly?: boolean;
  showRowNumbers?: boolean;
  className?: string;
}

interface CellPosition {
  row: number;
  col: number;
}

export default function ExcelTable<T extends Record<string, any>>({
  data,
  columns,
  onDataChange,
  onRowAdd,
  onRowDelete,
  readonly = false,
  showRowNumbers = true,
  className = '',
}: ExcelTableProps<T>) {
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const tableRef = useRef<HTMLTableElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const startEditing = useCallback((row: number, col: number) => {
    if (readonly || col < 0 || col >= columns.length) return;
    
    const column = columns[col];
    const rowData = data[row];
    const isReadonly = typeof column.readonly === 'function' 
      ? column.readonly(rowData)
      : column.readonly;
    if (isReadonly) return;

    const value = rowData?.[column.key] ?? '';
    const displayValue = column.format 
      ? column.format(value, rowData)
      : value?.toString() ?? '';

    setEditingCell({ row, col });
    setEditValue(displayValue);
  }, [data, columns, readonly]);

  const stopEditing = useCallback((save: boolean = true) => {
    if (!editingCell) return;

    const { row, col } = editingCell;
    const column = columns[col];
    const rowData = data[row];
    
    if (save && rowData) {
      let newValue: any = editValue;
      
      // Parse the value based on column type
      if (column.parse) {
        newValue = column.parse(editValue, rowData);
      } else {
        switch (column.type) {
          case 'number':
            newValue = editValue === '' ? 0 : parseFloat(editValue) || 0;
            break;
          case 'boolean':
            newValue = editValue === 'true' || editValue === '1' || editValue.toLowerCase() === 'yes';
            break;
          default:
            newValue = editValue;
        }
      }

      // Validate
      const errorKey = getCellKey(row, col);
      let error: string | null = null;
      
      if (column.validate) {
        error = column.validate(newValue, rowData);
      }

      if (error) {
        setErrors(prev => ({ ...prev, [errorKey]: error! }));
        return; // Don't save if validation fails
      }

      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });

      // Update data
      const newData = [...data];
      newData[row] = { ...rowData, [column.key]: newValue };
      onDataChange(newData);
    }

    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, data, columns, onDataChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!editingCell) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        stopEditing(true);
        // Move to next row, same column
        if (editingCell.row < data.length - 1) {
          startEditing(editingCell.row + 1, editingCell.col);
        }
        break;
      case 'Escape':
        e.preventDefault();
        stopEditing(false);
        break;
      case 'Tab':
        e.preventDefault();
        stopEditing(true);
        // Move to next column, or next row if at last column
        if (editingCell.col < columns.length - 1) {
          startEditing(editingCell.row, editingCell.col + 1);
        } else if (editingCell.row < data.length - 1) {
          startEditing(editingCell.row + 1, 0);
        }
        break;
      case 'ArrowUp':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          stopEditing(true);
          if (editingCell.row > 0) {
            startEditing(editingCell.row - 1, editingCell.col);
          }
        }
        break;
      case 'ArrowDown':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          stopEditing(true);
          if (editingCell.row < data.length - 1) {
            startEditing(editingCell.row + 1, editingCell.col);
          }
        }
        break;
      case 'ArrowLeft':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          stopEditing(true);
          if (editingCell.col > 0) {
            startEditing(editingCell.row, editingCell.col - 1);
          }
        }
        break;
      case 'ArrowRight':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          stopEditing(true);
          if (editingCell.col < columns.length - 1) {
            startEditing(editingCell.row, editingCell.col + 1);
          }
        }
        break;
    }
  }, [editingCell, data, columns, stopEditing, startEditing]);

  const handleCellClick = (row: number, col: number) => {
    if (readonly) return;
    startEditing(row, col);
  };

  const handleRowSelect = (rowIndex: number, e: React.MouseEvent) => {
    if (e.shiftKey) {
      // Select range
      const selected = Array.from(selectedRows);
      if (selected.length > 0) {
        const start = Math.min(...selected, rowIndex);
        const end = Math.max(...selected, rowIndex);
        const newSelection = new Set<number>();
        for (let i = start; i <= end; i++) {
          newSelection.add(i);
        }
        setSelectedRows(newSelection);
      } else {
        setSelectedRows(new Set([rowIndex]));
      }
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      const newSelection = new Set(selectedRows);
      if (newSelection.has(rowIndex)) {
        newSelection.delete(rowIndex);
      } else {
        newSelection.add(rowIndex);
      }
      setSelectedRows(newSelection);
    } else {
      // Single selection
      setSelectedRows(new Set([rowIndex]));
    }
  };

  const handleAddRow = () => {
    if (!onRowAdd) return;
    const newRow = onRowAdd();
    const newData = [...data, newRow];
    onDataChange(newData);
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (!onRowDelete) return;
    const newData = data.filter((_, index) => index !== rowIndex);
    onDataChange(newData);
    onRowDelete(rowIndex);
    setSelectedRows(new Set());
  };

  const handleDeleteSelectedRows = () => {
    if (selectedRows.size === 0) return;
    const indicesToDelete = Array.from(selectedRows).sort((a, b) => b - a);
    indicesToDelete.forEach(index => {
      handleDeleteRow(index);
    });
    setSelectedRows(new Set());
  };

  const renderCell = (row: number, col: number, rowData: T) => {
    const column = columns[col];
    const isEditing = editingCell?.row === row && editingCell?.col === col;
    const value = rowData[column.key];
    const errorKey = getCellKey(row, col);
    const hasError = errors[errorKey];

    if (isEditing) {
      return (
        <td
          key={col}
          className="relative p-0 border border-gray-400 bg-white"
          style={{ width: column.width }}
        >
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => stopEditing(true)}
            onKeyDown={handleKeyDown}
            className="w-full h-full px-2 py-1.5 border-0 outline-none bg-blue-50 text-sm font-medium"
            style={{ minHeight: '32px', boxShadow: 'inset 0 0 0 2px #3b82f6' }}
          />
          {hasError && (
            <div className="absolute top-full left-0 z-50 bg-red-100 text-red-800 text-xs p-1.5 rounded shadow-lg whitespace-nowrap border border-red-300 mt-1">
              {hasError}
            </div>
          )}
        </td>
      );
    }

    let displayValue: React.ReactNode = '';
    
    if (column.render) {
      displayValue = column.render(value, rowData, false);
    } else if (column.format) {
      displayValue = column.format(value, rowData);
    } else {
      switch (column.type) {
        case 'boolean':
          displayValue = value ? '✓' : '';
          break;
        case 'number':
          displayValue = value?.toString() ?? '';
          break;
        default:
          displayValue = value?.toString() ?? '';
      }
    }

    const isReadonly = typeof column.readonly === 'function' 
      ? column.readonly(rowData)
      : column.readonly;
    
    return (
      <td
        key={col}
        onClick={() => handleCellClick(row, col)}
        className={`p-2 border border-gray-400 text-sm ${
          hasError ? 'bg-red-50' : 'bg-white'
        } ${isReadonly ? 'bg-gray-100 cursor-default' : 'cursor-pointer hover:bg-blue-50'} transition-colors`}
        style={{ width: column.width }}
        title={hasError || undefined}
      >
        <div className="min-h-[20px] leading-5">
          {displayValue}
        </div>
        {hasError && (
          <div className="absolute top-full left-0 z-50 bg-red-100 text-red-800 text-xs p-1.5 rounded shadow-lg whitespace-nowrap border border-red-300 mt-1">
            {hasError}
          </div>
        )}
      </td>
    );
  };

  return (
    <div className={`excel-table-container ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {!readonly && onRowAdd && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="h-8 text-xs"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </Button>
          )}
          {!readonly && onRowDelete && selectedRows.size > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeleteSelectedRows}
              className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete ({selectedRows.size})
            </Button>
          )}
        </div>
      </div>
      
      <div className="border-2 border-gray-400 rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-auto bg-gray-50" style={{ maxHeight: '600px' }}>
          <div style={{ minWidth: 'max-content' }}>
            <table
              ref={tableRef}
              className="border-collapse bg-white"
              style={{ tableLayout: 'auto', width: 'max-content', minWidth: '100%' }}
            >
            <thead className="sticky top-0 z-10 bg-gray-200">
              <tr>
                {showRowNumbers && (
                  <th className="p-2 border border-gray-400 bg-gray-300 text-center font-bold text-xs w-12 border-b-2">
                    #
                  </th>
                )}
                {columns.map((column, colIndex) => (
                  <th
                    key={colIndex}
                    className="p-2 border border-gray-400 bg-gray-300 text-left font-bold text-xs border-b-2"
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
                {!readonly && onRowDelete && (
                  <th className="p-2 border border-gray-400 bg-gray-300 text-center font-bold text-xs w-16 border-b-2">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (showRowNumbers ? 1 : 0) + (!readonly && onRowDelete ? 1 : 0)}
                    className="p-8 text-center text-gray-500 border border-gray-400 bg-white"
                  >
                    No data. Click "Add Row" to add a new row.
                  </td>
                </tr>
              ) : (
                data.map((rowData, rowIndex) => {
                  const isSelected = selectedRows.has(rowIndex);
                  // Check if this is a product row (has type property)
                  const isProductRow = (rowData as any)?.type === 'product';
                  return (
                    <tr
                      key={rowIndex}
                      className={`${
                        isSelected 
                          ? 'bg-blue-200' 
                          : isProductRow 
                            ? 'bg-yellow-50 hover:bg-yellow-100' 
                            : 'bg-white hover:bg-blue-50'
                      } transition-colors`}
                    >
                      {showRowNumbers && (
                        <td
                          className={`p-2 border border-gray-400 text-center text-xs cursor-pointer select-none font-medium ${
                            isSelected 
                              ? 'bg-blue-300' 
                              : isProductRow 
                                ? 'bg-yellow-200' 
                                : 'bg-gray-100'
                          }`}
                          onClick={(e) => handleRowSelect(rowIndex, e)}
                          title={isProductRow ? 'Product Row' : `Variant Row ${rowIndex}`}
                        >
                          {isProductRow ? 'P' : rowIndex}
                        </td>
                      )}
                      {columns.map((_, colIndex) => renderCell(rowIndex, colIndex, rowData))}
                      {!readonly && onRowDelete && (
                        <td className="p-2 border border-gray-400 text-center bg-white">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRow(rowIndex)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
