'use client';

import { useState } from 'react';

interface TutorialFiltersProps {
  categories: Array<{ name: string; count: number }>;
  selectedCategory: string;
  selectedLevel: string;
  searchQuery: string;
  selectedSort: string;
  onFilterChange: (filters: Record<string, string | null>) => void;
}

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rated', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export default function TutorialFilters({
  categories,
  selectedCategory,
  selectedLevel,
  searchQuery,
  selectedSort,
  onFilterChange,
}: TutorialFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    onFilterChange({ search: localSearch || null });
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
      <h2 className="font-semibold text-gray-900 mb-4">Filters</h2>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search tutorials..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </form>

      {/* Sort */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={selectedSort}
          onChange={(e) => onFilterChange({ sort: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === ''}
              onChange={() => onFilterChange({ category: null })}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">All Categories</span>
          </label>
          {categories.map((category) => (
            <label key={category.name} className="flex items-center">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category.name}
                onChange={() => onFilterChange({ category: category.name })}
                className="mr-2"
              />
              <span className="text-sm text-gray-600 flex-1">
                {category.name}
              </span>
              <span className="text-xs text-gray-400">({category.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Level */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Level</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="level"
              checked={selectedLevel === ''}
              onChange={() => onFilterChange({ level: null })}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">All Levels</span>
          </label>
          {LEVELS.map((level) => (
            <label key={level} className="flex items-center">
              <input
                type="radio"
                name="level"
                checked={selectedLevel === level}
                onChange={() => onFilterChange({ level })}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() =>
          onFilterChange({
            category: null,
            level: null,
            search: null,
            sort: 'newest',
          })
        }
        className="w-full px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
}
