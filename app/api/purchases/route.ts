import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createPurchaseIntent } from '@/lib/services/purchaseService';

/**
 * POST /api/purchases
 *
 * Creates a purchase intent and returns Stripe Checkout URL.
 *
 * Request body:
 * {
 *   "tutorialId": "clx..."
 * }
 *
 * Response:
 * {
 *   "checkoutUrl": "https://checkout.stripe.com/...",
 *   "sessionId": "cs_..."
 * }
 */
const createPurchaseSchema = z.object({
  tutorialId: z.string().cuid(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const { tutorialId } = createPurchaseSchema.parse(body);

    // 3. Fetch tutorial details
    const tutorial = await prisma.tutorial.findUnique({
      where: { id: tutorialId },
      include: { creator: true },
    });

    if (!tutorial) {
      return NextResponse.json(
        { error: 'Tutorial not found' },
        { status: 404 }
      );
    }

    if (tutorial.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Tutorial is not available for purchase' },
        { status: 400 }
      );
    }

    // 4. Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const result = await createPurchaseIntent({
      userId: session.user.id,
      tutorialId,
      tutorialTitle: tutorial.title,
      price: tutorial.price,
      creatorAccountId: tutorial.stripeAccountId!,
      userEmail: session.user.email!,
      successUrl: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/tutorials/${tutorialId}`,
    });

    // 5. Return checkout URL
    return NextResponse.json({
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }

    // Handle business logic errors
    if (error instanceof Error) {
      if (error.message === 'You already own this tutorial') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      if (error.message === 'Creator payment account not configured') {
        return NextResponse.json(
          { error: 'This tutorial is not ready for purchase' },
          { status: 400 }
        );
      }
    }

    // Log unexpected errors
    console.error('Error creating purchase:', error);

    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/purchases
 *
 * Fetches all purchases for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Fetch user purchases
    const { getUserPurchases } = await import('@/lib/services/purchaseService');

    const purchases = await getUserPurchases(session.user.id);

    // 3. Return purchases
    return NextResponse.json({ purchases });
  } catch (error) {
    console.error('Error fetching purchases:', error);

    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}
