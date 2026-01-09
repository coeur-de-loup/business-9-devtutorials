'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
  requirements: string[];
  learningGoals: string[];
  curriculum: any;
  publishedAt: string | null;
  lastUpdated: string;
  creator: {
    id: string;
    name: string | null;
    image: string | null;
  };
  videoAssets: Array<{
    id: string;
    title: string;
    duration: number;
    lessonIndex: number;
  }>;
  avgRating: number;
  reviewCount: number;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: {
      name: string | null;
      image: string | null;
    };
  }>;
  _count: {
    purchases: number;
    reviews: number;
  };
}

export default function TutorialDetail({ tutorialId }: { tutorialId: string }) {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTutorial() {
      try {
        const res = await fetch(`/api/tutorials/${tutorialId}`);

        if (!res.ok) {
          if (res.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch tutorial');
        }

        const data = await res.json();
        setTutorial(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchTutorial();
  }, [tutorialId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Tutorial Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              {error || 'The tutorial you are looking for does not exist.'}
            </p>
            <Link
              href="/tutorials"
              className="text-blue-600 hover:text-blue-700"
            >
              Browse all tutorials
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const priceInDollars = tutorial.price / 100;
  const curriculum = tutorial.curriculum as Array<{
    title: string;
    duration: number;
    description?: string;
  }>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span>›</span>
            <Link href="/tutorials" className="hover:text-blue-600">
              Tutorials
            </Link>
            <span>›</span>
            <span className="text-gray-900">{tutorial.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Preview / Thumbnail */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative aspect-video bg-gray-900">
                {tutorial.thumbnail ? (
                  <Image
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                    <span className="text-white text-6xl font-bold">
                      {tutorial.title.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <button className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <svg
                      className="w-8 h-8 text-blue-600 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Tutorial Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  {tutorial.category && (
                    <span className="text-sm text-blue-600 font-medium">
                      {tutorial.category}
                    </span>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 mt-2">
                    {tutorial.title}
                  </h1>
                </div>
                {tutorial.level && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {tutorial.level}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  ⭐ {tutorial.avgRating.toFixed(1)} ({tutorial.reviewCount}{' '}
                  reviews)
                </span>
                <span>{tutorial._count.purchases} students</span>
                {tutorial.duration && (
                  <span>{Math.round(tutorial.duration / 60)} hours</span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6">{tutorial.description}</p>

              {/* Tags */}
              {tutorial.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tutorial.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* What You'll Learn */}
            {tutorial.learningGoals.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  What You'll Learn
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tutorial.learningGoals.map((goal, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {tutorial.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Prerequisites
                </h2>
                <ul className="space-y-2">
                  {tutorial.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Curriculum */}
            {curriculum && curriculum.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Curriculum
                </h2>
                <div className="space-y-3">
                  {curriculum.map((lesson, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {Math.round(lesson.duration / 60)} min
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {tutorial.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Reviews
                </h2>
                <div className="space-y-4">
                  {tutorial.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b pb-4 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        {review.user.image ? (
                          <Image
                            src={review.user.image}
                            alt={review.user.name || 'User'}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              {review.user.name || 'Anonymous'}
                            </h4>
                            <div className="flex items-center gap-1 text-sm">
                              {Array.from({ length: review.rating }).map(
                                (_, i) => (
                                  <span key={i}>⭐</span>
                                )
                              )}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 mt-1">{review.comment}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="text-3xl font-bold text-gray-900 mb-4">
                ${priceInDollars}
              </div>
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3">
                Purchase Now
              </button>
              <p className="text-xs text-center text-gray-500">
                One-time payment • Lifetime access
              </p>

              <div className="mt-6 pt-6 border-t space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    6-month freshness guarantee
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Expert-vetted content
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Source code included
                  </span>
                </div>
              </div>
            </div>

            {/* Creator Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-3">About the Creator</h3>
              <div className="flex items-center gap-3 mb-3">
                {tutorial.creator.image ? (
                  <Image
                    src={tutorial.creator.image}
                    alt={tutorial.creator.name || 'Creator'}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300" />
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {tutorial.creator.name || 'Anonymous'}
                  </div>
                  <div className="text-sm text-gray-600">Course Creator</div>
                </div>
              </div>
            </div>

            {/* Freshness Badge */}
            {tutorial.publishedAt && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Fresh Content Guarantee
                    </h4>
                    <p className="text-sm text-gray-700">
                      Last updated{' '}
                      {new Date(tutorial.lastUpdated).toLocaleDateString()}.{' '}
                      Updated within 6 months or your money back.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
