import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockTutorials, mockReviews } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    let tutorial: any;
    let reviews: any[] = [];

    try {
      // Try database first
      const dbTutorial = await prisma.tutorial.findUnique({
        where: { id: params.id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          videoAssets: {
            orderBy: { lessonIndex: 'asc' },
          },
          _count: {
            select: {
              purchases: true,
              reviews: true,
            },
          },
        },
      });

      if (!dbTutorial) {
        return NextResponse.json(
          { error: 'Tutorial not found' },
          { status: 404 }
        );
      }

      if (dbTutorial.status !== 'PUBLISHED') {
        return NextResponse.json(
          { error: 'Tutorial not available' },
          { status: 403 }
        );
      }

      // Fetch reviews
      const dbReviews = await prisma.review.findMany({
        where: { tutorialId: params.id },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      const avgRating =
        dbReviews.length > 0
          ? dbReviews.reduce((sum, r) => sum + r.rating, 0) / dbReviews.length
          : 0;

      tutorial = {
        ...dbTutorial,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: dbReviews.length,
      };
      reviews = dbReviews;
    } catch (dbError) {
      // Fall back to mock data
      console.warn('Database unavailable, using mock data:', dbError);

      const mockTutorial = mockTutorials.find((t) => t.id === params.id);

      if (!mockTutorial) {
        return NextResponse.json(
          { error: 'Tutorial not found' },
          { status: 404 }
        );
      }

      tutorial = {
        ...mockTutorial,
        videoAssets: mockTutorial.curriculum.map((lesson, index) => ({
          id: `video-${index}`,
          title: lesson.title,
          duration: lesson.duration,
          lessonIndex: index,
        })),
      };
      reviews = mockReviews;
    }

    return NextResponse.json({
      ...tutorial,
      reviews: reviews.slice(0, 5),
    });
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorial' },
      { status: 500 }
    );
  }
}
