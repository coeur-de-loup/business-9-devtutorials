import { prisma } from '@/lib/prisma';
import { stripe, createCheckoutSession, getCheckoutSession } from '@/lib/stripe';
import { z } from 'zod';
import type { Purchase, CreatorEarning } from '@prisma/client';

/**
 * Purchase Service
 *
 * Business logic for tutorial purchases, payment processing,
 * and creator earnings tracking.
 */

export const purchaseSchema = z.object({
  tutorialId: z.string().cuid(),
});

export interface CreatePurchaseParams {
  userId: string;
  tutorialId: string;
  tutorialTitle: string;
  price: number;
  creatorAccountId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create Purchase Intent
 *
 * Validates tutorial availability and creates Stripe Checkout session.
 * Returns checkout URL for user to complete payment.
 */
export async function createPurchaseIntent(
  params: CreatePurchaseParams
): Promise<{ checkoutUrl: string; sessionId: string }> {
  const {
    userId,
    tutorialId,
    tutorialTitle,
    price,
    creatorAccountId,
    userEmail,
    successUrl,
    cancelUrl,
  } = params;

  // Verify tutorial exists and is published
  const tutorial = await prisma.tutorial.findUnique({
    where: { id: tutorialId },
    include: { creator: true },
  });

  if (!tutorial) {
    throw new Error('Tutorial not found');
  }

  if (tutorial.status !== 'PUBLISHED') {
    throw new Error('Tutorial is not available for purchase');
  }

  // Check if user already purchased this tutorial
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      userId_tutorialId: {
        userId,
        tutorialId,
      },
    },
  });

  if (existingPurchase) {
    throw new Error('You already own this tutorial');
  }

  // Verify creator has Stripe Connect account
  if (!tutorial.stripeAccountId || !creatorAccountId) {
    throw new Error('Creator payment account not configured');
  }

  // Create Stripe Checkout session
  const session = await createCheckoutSession({
    tutorialId,
    tutorialTitle,
    price,
    creatorAccountId,
    userId,
    userEmail,
    successUrl,
    cancelUrl,
  });

  return {
    checkoutUrl: session.url!,
    sessionId: session.id,
  };
}

/**
 * Process Successful Payment
 *
 * Called by Stripe webhook handler after successful payment.
 * Records purchase, calculates creator earnings, updates stats.
 */
export async function processSuccessfulPayment(
  sessionId: string
): Promise<{ purchase: Purchase; creatorEarning: CreatorEarning }> {
  // Retrieve session from Stripe
  const session = await getCheckoutSession(sessionId);

  if (!session.metadata?.tutorialId || !session.metadata?.userId) {
    throw new Error('Invalid session metadata');
  }

  const { tutorialId, userId } = session.metadata;

  // Verify tutorial and get pricing
  const tutorial = await prisma.tutorial.findUnique({
    where: { id: tutorialId },
  });

  if (!tutorial) {
    throw new Error('Tutorial not found');
  }

  // Check if purchase already exists (idempotency)
  const existingPurchase = await prisma.purchase.findUnique({
    where: { stripeSessionId: sessionId },
  });

  if (existingPurchase) {
    // Fetch creator earnings for this purchase
    const creatorEarning = await prisma.creatorEarning.findUnique({
      where: { purchaseId: existingPurchase.id },
    });

    return {
      purchase: existingPurchase,
      creatorEarning: creatorEarning!,
    };
  }

  // Calculate creator share (70%) and platform fee (30%)
  const purchaseAmount = tutorial.price; // Already in cents
  const creatorShare = Math.round(purchaseAmount * 0.70);
  const platformFee = Math.round(purchaseAmount * 0.30);

  // Create purchase record and creator earnings in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create purchase record
    const purchase = await tx.purchase.create({
      data: {
        userId,
        tutorialId,
        amount: purchaseAmount,
        stripeSessionId: sessionId,
      },
    });

    // Create creator earnings record
    const creatorEarning = await tx.creatorEarning.create({
      data: {
        creatorId: tutorial.creatorId,
        tutorialId,
        purchaseId: purchase.id,
        amount: creatorShare,
        paidOut: false,
      },
    });

    // Update tutorial purchase count (via _count)
    // Note: Prisma handles this automatically via relation

    return { purchase, creatorEarning };
  });

  return result;
}

/**
 * Get User Purchases
 *
 * Fetches all tutorials purchased by a user.
 */
export async function getUserPurchases(userId: string) {
  const purchases = await prisma.purchase.findMany({
    where: { userId },
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
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return purchases;
}

/**
 * Check if User Owns Tutorial
 *
 * Returns true if user has purchased the tutorial.
 */
export async function userOwnsTutorial(
  userId: string,
  tutorialId: string
): Promise<boolean> {
  const purchase = await prisma.purchase.findUnique({
    where: {
      userId_tutorialId: {
        userId,
        tutorialId,
      },
    },
  });

  return !!purchase;
}

/**
 * Get Creator Earnings
 *
 * Fetches earnings summary for a creator.
 */
export async function getCreatorEarnings(creatorId: string) {
  const earnings = await prisma.creatorEarning.findMany({
    where: { creatorId },
    include: {
      tutorial: {
        select: {
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate totals
  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const paidOut = earnings
    .filter((e) => e.paidOut)
    .reduce((sum, e) => sum + e.amount, 0);
  const pending = totalEarnings - paidOut;

  return {
    earnings,
    totals: {
      totalEarnings,
      paidOut,
      pending,
    },
  };
}

/**
 * Mark Creator Earnings as Paid
 *
 * Updates earnings records after payout is sent.
 */
export async function markEarningsAsPaid(
  earningIds: string[],
  payoutId: string
): Promise<void> {
  await prisma.creatorEarning.updateMany({
    where: {
      id: { in: earningIds },
    },
    data: {
      paidOut: true,
      paidAt: new Date(),
    },
  });
}

/**
 * Get Purchase by Session ID
 *
 * Retrieves purchase record using Stripe session ID.
 */
export async function getPurchaseBySessionId(sessionId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { stripeSessionId: sessionId },
    include: {
      tutorial: {
        include: {
          creator: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return purchase;
}
