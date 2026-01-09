import { NextRequest, NextResponse } from 'next/server';
import { stripe, createCreatorAccount, createAccountLink } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

/**
 * POST /api/stripe/connect/onboarding
 *
 * Initiates Stripe Connect onboarding for creators
 *
 * Creates a Stripe Express account and generates an onboarding link
 *
 * Request Body:
 * {}
 *
 * Response:
 * {
 *   url: string - Stripe onboarding URL
 *   accountId: string - Stripe account ID
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Verify user is a creator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'CREATOR' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only creators can connect Stripe accounts' },
        { status: 403 }
      );
    }

    // 3. Check if user already has a connected account
    // We check the User model for a stripeAccountId field
    // Note: You may need to add this field to the User model schema
    const existingAccountId = (user as any).stripeAccountId;

    if (existingAccountId) {
      // User already has an account, check if onboarding is complete
      const account = await stripe.accounts.retrieve(existingAccountId);

      if (account.details_submitted) {
        return NextResponse.json(
          {
            error: 'Stripe account already connected',
            accountId: existingAccountId,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
          },
          { status: 400 }
        );
      }

      // Onboarding not complete, create new link for existing account
      const origin = req.headers.get('origin') || 'http://localhost:3000';
      const refreshUrl = `${origin}/creator/stripe/refresh`;
      const returnUrl = `${origin}/creator/stripe/success`;

      const accountLink = await createAccountLink(
        existingAccountId,
        refreshUrl,
        returnUrl
      );

      return NextResponse.json({
        url: accountLink.url,
        accountId: existingAccountId,
        isNew: false,
      });
    }

    // 4. Create new Stripe Express account
    const creatorName = user.name || user.email?.split('@')[0] || 'Creator';
    const account = await createCreatorAccount(
      user.email || '',
      creatorName
    );

    // 5. Store stripeAccountId on User model
    // Note: You'll need to add stripeAccountId field to User model in schema.prisma
    await prisma.user.update({
      where: { id: userId },
      data: { stripeAccountId: account.id } as any,
    });

    // 6. Create onboarding link
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const refreshUrl = `${origin}/creator/stripe/refresh`;
    const returnUrl = `${origin}/creator/stripe/success`;

    const accountLink = await createAccountLink(
      account.id,
      refreshUrl,
      returnUrl
    );

    // 7. Return onboarding URL
    return NextResponse.json({
      url: accountLink.url,
      accountId: account.id,
      isNew: true,
    });
  } catch (error) {
    console.error('Stripe Connect onboarding error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate Stripe Connect onboarding',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/connect/onboarding
 *
 * Checks user's Stripe Connect account status
 *
 * Response:
 * {
 *   connected: boolean - Whether Stripe account is connected
 *   chargesEnabled: boolean - Whether account can receive payments
 *   payoutsEnabled: boolean - Whether account can receive payouts
 *   detailsSubmitted: boolean - Whether onboarding is complete
 * }
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Get user with stripeAccountId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeAccountId: true as any,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 3. Check if account exists
    const stripeAccountId = (user as any).stripeAccountId;

    if (!stripeAccountId) {
      return NextResponse.json({
        connected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      });
    }

    // 4. Fetch account status from Stripe
    const account = await stripe.accounts.retrieve(stripeAccountId);

    return NextResponse.json({
      connected: true,
      accountId: stripeAccountId,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (error) {
    console.error('Stripe Connect status check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check Stripe Connect status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
