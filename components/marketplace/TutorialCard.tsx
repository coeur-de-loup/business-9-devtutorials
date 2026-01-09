import Link from 'next/link';
import Image from 'next/image';

interface TutorialCardProps {
  tutorial: {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnail: string | null;
    category: string | null;
    level: string | null;
    duration: number | null;
    tags: string[];
    avgRating: number;
    reviewCount: number;
    _count: {
      purchases: number;
    };
    creator: {
      name: string | null;
      image: string | null;
    };
  };
}

export default function TutorialCard({ tutorial }: TutorialCardProps) {
  const priceInDollars = tutorial.price / 100;

  return (
    <Link href={`/tutorials/${tutorial.id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-100">
          {tutorial.thumbnail ? (
            <Image
              src={tutorial.thumbnail}
              alt={tutorial.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-white text-4xl font-bold">
                {tutorial.title.charAt(0)}
              </span>
            </div>
          )}

          {/* Badge for level */}
          {tutorial.level && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
              {tutorial.level}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Category */}
          {tutorial.category && (
            <div className="text-xs text-blue-600 font-medium mb-2">
              {tutorial.category}
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {tutorial.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
            {tutorial.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            {tutorial.duration && (
              <span>{Math.round(tutorial.duration / 60)} hours</span>
            )}
            <span>•</span>
            <span>{tutorial._count.purchases} students</span>
            {tutorial.avgRating > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  ⭐ {tutorial.avgRating} ({tutorial.reviewCount})
                </span>
              </>
            )}
          </div>

          {/* Tags */}
          {tutorial.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tutorial.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t">
            {/* Creator */}
            <div className="flex items-center gap-2">
              {tutorial.creator.image ? (
                <Image
                  src={tutorial.creator.image}
                  alt={tutorial.creator.name || 'Creator'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300" />
              )}
              <span className="text-xs text-gray-600">
                {tutorial.creator.name || 'Anonymous'}
              </span>
            </div>

            {/* Price */}
            <div className="font-bold text-gray-900">
              ${priceInDollars}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
