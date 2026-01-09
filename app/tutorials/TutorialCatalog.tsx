'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TutorialCard from '@/components/marketplace/TutorialCard';
import TutorialFilters from '@/components/marketplace/TutorialFilters';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string | null;
  category: string | null;
  level: string | null;
  duration: number | null;
  tags: string[];
  createdAt: string;
  publishedAt: string | null;
  creator: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    purchases: number;
    reviews: number;
  };
  avgRating: number;
  reviewCount: number;
}

interface Category {
  name: string;
  count: number;
}

export default function TutorialCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Get filter values from URL
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const level = searchParams.get('level') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      if (level) params.set('level', level);
      if (sort) params.set('sort', sort);
      params.set('page', page.toString());
      params.set('limit', '20');

      try {
        // Fetch tutorials and categories in parallel
        const [tutorialsRes, categoriesRes] = await Promise.all([
          fetch(`/api/tutorials?${params.toString()}`),
          fetch('/api/categories'),
        ]);

        const tutorialsData = await tutorialsRes.json();
        const categoriesData = await categoriesRes.json();

        setTutorials(tutorialsData.tutorials);
        setPagination(tutorialsData.pagination);
        setCategories(categoriesData.categories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [category, search, level, sort, page]);

  function updateFilters(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    if (newParams.page === undefined) {
      params.set('page', '1');
    }

    router.push(`/tutorials?${params.toString()}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Browse Tutorials
        </h1>
        <p className="text-gray-600">
          Expert-vetted, project-based tutorials for intermediate developers
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <TutorialFilters
            categories={categories}
            selectedCategory={category}
            selectedLevel={level}
            searchQuery={search}
            selectedSort={sort}
            onFilterChange={updateFilters}
          />
        </aside>

        {/* Tutorial Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : tutorials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tutorials found</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="mb-4 text-sm text-gray-600">
                Showing {tutorials.length} of {pagination.total} tutorials
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tutorials.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => updateFilters({ page: String(page - 1) })}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => updateFilters({ page: String(page + 1) })}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
