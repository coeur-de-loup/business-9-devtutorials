import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

/**
 * GET /api/admin/tutorials
 *
 * Fetch all tutorials pending review (for admin panel)
 *
 * Query params:
 * - status: Filter by status (default: PENDING_REVIEW)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 */
export async function GET(request: Request) {
  try {
    // Check admin authorization
    const authResult = await requireRole(request as any, 'ADMIN');
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING_REVIEW';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status !== 'ALL') {
      where.status = status;
    }

    // Fetch tutorials with pagination
    const [tutorials, total] = await Promise.all([
      prisma.tutorial.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.tutorial.count({ where }),
    ]);

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
    console.error('Error fetching admin tutorials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorials' },
      { status: 500 }
    );
  }
}
