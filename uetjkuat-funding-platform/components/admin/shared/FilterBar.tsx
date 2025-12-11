import React from 'react';
import { Search, X, Filter, Download, RefreshCw, Plus } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  onExport?: () => void;
  onRefresh?: () => void;
  onCreate?: () => void;
  createLabel?: string;
  isRefreshing?: boolean;
  customFilters?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = 'Filter',
  onExport,
  onRefresh,
  onCreate,
  createLabel = 'Create New',
  isRefreshing = false,
  customFilters,
  className = ''
}: FilterBarProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter dropdown */}
        {filterOptions && onFilterChange && (
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground cursor-pointer min-w-[150px]"
            >
              <option value="">{filterLabel}</option>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom filters */}
        {customFilters}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          {onExport && (
            <button
              onClick={onExport}
              className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors flex items-center gap-2"
              title="Export data"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {onCreate && (
            <button
              onClick={onCreate}
              className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2 font-medium shadow-sm"
              title={createLabel}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{createLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Date range filter component
interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear?: () => void;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
      />
      <span className="text-muted-foreground">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
      />
      {onClear && (startDate || endDate) && (
        <button
          onClick={onClear}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          title="Clear dates"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
