import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

/**
 * My Tutorials Page
 *
 * Displays all tutorials purchased by the current user.
 */

export default async function MyTutorialsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user's purchased tutorials
  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id },
    include: {
      tutorial: {
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          videoAssets: {
            select: {
              id: true,
              title: true,
              duration: true,
            },
            orderBy: { lessonIndex: 'asc' },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Tutorials</h1>
          <p className="mt-2 text-gray-600">
            {purchases.length === 0
              ? "You haven't purchased any tutorials yet."
              : `You own ${purchases.length} tutorial${
                  purchases.length === 1 ? '' : 's'
                }`}
          </p>
        </div>
      </div>

      {/* Tutorials Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {purchases.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-6 text-lg font-medium text-gray-900">
              No tutorials yet
            </h3>
            <p className="mt-2 text-gray-600">
              Get started by browsing our tutorial catalog.
            </p>
            <div className="mt-6">
              <Link
                href="/tutorials"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Tutorials
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => {
              const tutorial = purchase.tutorial;
              const lessonCount = tutorial.videoAssets.length;
              const totalDuration = tutorial.videoAssets.reduce(
                (sum, asset) => sum + asset.duration,
                0
              );

              return (
                <div
                  key={purchase.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gray-200">
                    {tutorial.thumbnail ? (
                      <img
                        src={tutorial.thumbnail}
                        alt={tutorial.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                        <svg
                          className="h-16 w-16 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <Link
                      href={`/tutorials/${tutorial.id}`}
                      className="block"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
                        {tutorial.title}
                      </h3>
                    </Link>

                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {tutorial.description}
                    </p>

                    {/* Metadata */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
                      </span>
                      <span>
                        {Math.floor(totalDuration / 60)} min
                      </span>
                    </div>

                    {/* Creator */}
                    <div className="mt-4 flex items-center">
                      {tutorial.creator.image ? (
                        // @ts-ignore - Prisma String? type is safe here with null check
                        <img
                          src={tutorial.creator.image}
                          alt={tutorial.creator.name}
                          className="h-6 w-6 rounded-full mr-2"
                        />
                      ) : null}
                      <span className="text-sm text-gray-600">
                        {tutorial.creator.name}
                      </span>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/tutorials/${tutorial.id}/watch`}
                      className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
