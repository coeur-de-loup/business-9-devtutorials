import { Suspense } from 'react';
import TutorialCatalog from './TutorialCatalog';

export const metadata = {
  title: 'Browse Tutorials - DevTutorials',
  description: 'Browse our curated collection of expert-vetted, project-based tutorials for intermediate developers.',
};

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<CatalogSkeleton />}>
        <TutorialCatalog />
      </Suspense>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
