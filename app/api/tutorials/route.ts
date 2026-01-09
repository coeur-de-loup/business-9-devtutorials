import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockTutorials } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const level = searchParams.get('level');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Try to use database, fall back to mock data
    let tutorials: any[];
    let total: number;

    try {
      // Build where clause
      const where: any = {
        status: 'PUBLISHED',
      };

      if (category) {
        where.category = category;
      }

      if (level) {
        where.level = level;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search] } },
        ];
      }

      // Build order by
      let orderBy: any = {};
      switch (sort) {
        case 'price-low':
          orderBy = { price: 'asc' };
          break;
        case 'price-high':
          orderBy = { price: 'desc' };
          break;
        case 'popular':
          orderBy = { purchases: { _count: 'desc' } };
          break;
        case 'rated':
          orderBy = { reviews: { _count: 'desc' } };
          break;
        case 'newest':
        default:
          orderBy = { publishedAt: 'desc' };
          break;
      }

      // Fetch tutorials with pagination
      const [dbTutorials, dbTotal] = await Promise.all([
        prisma.tutorial.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                purchases: true,
                reviews: true,
              },
            },
          },
        }),
        prisma.tutorial.count({ where }),
      ]);

      // Calculate average rating for each tutorial
      tutorials = await Promise.all(
        dbTutorials.map(async (tutorial) => {
          const reviews = await prisma.review.findMany({
            where: { tutorialId: tutorial.id },
            select: { rating: true },
          });

          const avgRating =
            reviews.length > 0
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              : 0;

          return {
            ...tutorial,
            avgRating: Math.round(avgRating * 10) / 10,
            reviewCount: reviews.length,
          };
        })
      );

      total = dbTotal;
    } catch (dbError) {
      // Fall back to mock data if database fails
      console.warn('Database unavailable, using mock data:', dbError);

      // Filter mock data
      let filtered = [...mockTutorials];

      if (category) {
        filtered = filtered.filter((t) => t.category === category);
      }

      if (level) {
        filtered = filtered.filter((t) => t.level === level);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.title.toLowerCase().includes(searchLower) ||
            t.description.toLowerCase().includes(searchLower) ||
            t.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }

      // Sort mock data
      switch (sort) {
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'popular':
          filtered.sort((a, b) => b._count.purchases - a._count.purchases);
          break;
        case 'rated':
          filtered.sort((a, b) => b.avgRating - a.avgRating);
          break;
        case 'newest':
        default:
          filtered.sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
          break;
      }

      // Pagination for mock data
      total = filtered.length;
      const start = skip;
      const end = skip + limit;
      tutorials = filtered.slice(start, end);
    }

    return NextResponse.json({
      tutorials,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorials' },
      { status: 500 }
    );
  }
}
