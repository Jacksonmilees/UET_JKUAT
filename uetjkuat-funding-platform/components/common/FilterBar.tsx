import React from 'react';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortOptions: { label: string; value: string }[];
  selectedSort: string;
  onSortChange: (sort: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  sortOptions,
  selectedSort,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Category Filter */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="
            w-full px-4 py-3 border-2 border-gray-300 rounded-xl
            focus:ring-4 focus:ring-blue-100 focus:border-blue-500
            transition-all duration-200
            bg-white text-gray-900
            outline-none
          "
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Sort Options */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="
            w-full px-4 py-3 border-2 border-gray-300 rounded-xl
            focus:ring-4 focus:ring-blue-100 focus:border-blue-500
            transition-all duration-200
            bg-white text-gray-900
            outline-none
          "
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
