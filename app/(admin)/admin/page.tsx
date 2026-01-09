'use client';

import { useEffect, useState } from 'react';
import TutorialReviewPanel from '@/components/admin/TutorialReviewPanel';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  category: string | null;
  level: string | null;
  tags: string[];
  duration: number | null;
  creator: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    stripeAccountId: string | null;
  };
  curriculum: any;
  requirements: string[];
  learningGoals: string[];
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  _count: {
    purchases: number;
    reviews: number;
  };
}

interface ApiResponse {
  tutorials: Tutorial[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminDashboard() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_REVIEW');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  useEffect(() => {
    fetchTutorials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        status: statusFilter,
        page: page.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/admin/tutorials?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tutorials');
      }

      const data: ApiResponse = await response.json();
      setTutorials(data.tutorials);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tutorials');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewComplete = () => {
    setSelectedTutorial(null);
    fetchTutorials();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Review and moderate tutorial submissions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {pagination.total}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="PUBLISHED">Published</option>
                <option value="REJECTED">Rejected</option>
                <option value="ALL">All</option>
              </select>
            </div>

            <button
              onClick={fetchTutorials}
              className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading tutorials...</p>
          </div>
        ) : tutorials.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tutorials</h3>
            <p className="mt-1 text-sm text-gray-500">
              No tutorials found for this filter.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {tutorials.map((tutorial) => (
                <li
                  key={tutorial.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTutorial(tutorial)}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {tutorial.title}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                              tutorial.status
                            )}`}
                          >
                            {tutorial.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {tutorial.description}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>Creator: {tutorial.creator.name || tutorial.creator.email}</span>
                          <span>Category: {tutorial.category || 'N/A'}</span>
                          <span>Level: {tutorial.level || 'N/A'}</span>
                          <span>Price: ${(tutorial.price / 100).toFixed(2)}</span>
                          <span>
                            Created: {new Date(tutorial.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-5 flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                      disabled={page === pagination.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">
                          {(page - 1) * pagination.limit + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(page * pagination.limit, pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                          .filter(
                            (pageNum) =>
                              pageNum === 1 ||
                              pageNum === pagination.totalPages ||
                              (pageNum >= page - 1 && pageNum <= page + 1)
                          )
                          .map((pageNum, idx, arr) => {
                            const prevPage = arr[idx - 1];
                            const showDots = prevPage && pageNum - prevPage > 1;

                            return (
                              <div key={pageNum}>
                                {showDots && (
                                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    ...
                                  </span>
                                )}
                                <button
                                  onClick={() => setPage(pageNum)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    page === pageNum
                                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              </div>
                            );
                          })}
                        <button
                          onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                          disabled={page === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Panel Modal */}
      {selectedTutorial && (
        <TutorialReviewPanel
          tutorial={selectedTutorial}
          onClose={() => setSelectedTutorial(null)}
          onComplete={handleReviewComplete}
        />
      )}
    </div>
  );
}
