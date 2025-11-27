import React, { useState } from 'react';
import { IconSearch, IconX } from '../icons';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  className = '',
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <IconSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="
          block w-full pl-10 pr-10 py-3
          border-2 border-gray-300 rounded-xl
          focus:ring-4 focus:ring-blue-100 focus:border-blue-500
          transition-all duration-200
          text-gray-900 placeholder-gray-500
          outline-none
        "
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl transition-colors"
          aria-label="Clear search"
        >
          <IconX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
