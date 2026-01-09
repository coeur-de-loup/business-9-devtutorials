import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { z } from 'zod';

/**
 * Validation schema for tutorial review
 */
const ReviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNotes: z.string().optional(),
  rejectionReasons: z.array(z.string()).optional(),
});

/**
 * PATCH /api/admin/tutorials/[id]
 *
 * Approve or reject a tutorial submission
 *
 * Body:
 * - action: 'approve' | 'reject'
 * - adminNotes: Optional notes from admin
 * - rejectionReasons: Optional array of rejection reasons
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authorization
    const authResult = await requireRole(request as any, 'ADMIN');
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }

    const tutorialId = params.id;

    // Check if tutorial exists
    const tutorial = await prisma.tutorial.findUnique({
      where: { id: tutorialId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!tutorial) {
      return NextResponse.json(
        { error: 'Tutorial not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validationResult = ReviewSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { action, adminNotes, rejectionReasons } = validationResult.data;
    const adminUser = authResult.user;

    // Update tutorial based on action
    let updatedTutorial;
    const now = new Date();

    if (action === 'approve') {
      // Approve tutorial
      updatedTutorial = await prisma.tutorial.update({
        where: { id: tutorialId },
        data: {
          status: 'PUBLISHED',
          publishedAt: now,
          lastUpdated: now,
          freshnessExpires: new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
          adminNotes: adminNotes || null,
          reviewedAt: now,
          reviewedBy: adminUser.id,
        },
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
      });
    } else {
      // Reject tutorial
      const notes = rejectionReasons?.join('\n')
        ? `${rejectionReasons.join('\n')}\n\n${adminNotes || ''}`.trim()
        : adminNotes || null;

      updatedTutorial = await prisma.tutorial.update({
        where: { id: tutorialId },
        data: {
          status: 'REJECTED',
          adminNotes: notes,
          reviewedAt: now,
          reviewedBy: adminUser.id,
          lastUpdated: now,
        },
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
      });
    }

    return NextResponse.json({
      success: true,
      tutorial: updatedTutorial,
      message: action === 'approve'
        ? 'Tutorial approved and published'
        : 'Tutorial rejected',
    });
  } catch (error) {
    console.error('Error reviewing tutorial:', error);
    return NextResponse.json(
      { error: 'Failed to review tutorial' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/tutorials/[id]
 *
 * Get detailed information about a specific tutorial for review
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authorization
    const authResult = await requireRole(request as any, 'ADMIN');
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const tutorialId = params.id;

    const tutorial = await prisma.tutorial.findUnique({
      where: { id: tutorialId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            stripeAccountId: true,
          },
        },
        videoAssets: {
          orderBy: {
            lessonIndex: 'asc',
          },
        },
        _count: {
          select: {
            purchases: true,
            reviews: true,
          },
        },
      },
    });

    if (!tutorial) {
      return NextResponse.json(
        { error: 'Tutorial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tutorial });
  } catch (error) {
    console.error('Error fetching tutorial details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutorial details' },
      { status: 500 }
    );
  }
}
