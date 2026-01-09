import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { constructWebhookEvent } from '@/lib/stripe';
import {
  processSuccessfulPayment,
  getPurchaseBySessionId,
} from '@/lib/services/purchaseService';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for payment processing.
 *
 * Events handled:
 * - checkout.session.completed: Payment successful, record purchase
 * - payment_intent.succeeded: Payment succeeded (fallback)
 * - payment_intent.payment_failed: Payment failed
 *
 * Security: Verifies Stripe webhook signature
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get webhook signature
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // 2. Get webhook secret
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // 3. Read request body
    const rawBody = await request.text();

    // 4. Verify webhook signature
    let event;
    try {
      event = constructWebhookEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 5. Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Verify payment status
        if (session.payment_status !== 'paid') {
          console.log(`Session ${session.id} not paid, skipping`);
          return NextResponse.json({ received: true });
        }

        console.log(`Processing payment for session: ${session.id}`);

        // Process successful payment
        try {
          const result = await processSuccessfulPayment(session.id);

          console.log(
            `Purchase recorded: ${result.purchase.id}, Creator earning: ${result.creatorEarning.id}`
          );

          // TODO: Send purchase confirmation email to user
          // TODO: Send new sale notification to creator

        } catch (error) {
          console.error('Error processing payment:', error);

          // Don't return 500 - webhook already processed by Stripe
          // Just log and continue to prevent duplicate processing
        }

        break;
      }

      case 'payment_intent.succeeded': {
        // Fallback handler if checkout.session.completed is missed
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        if (!paymentIntent.metadata.sessionId) {
          console.log('Payment intent has no session ID, skipping');
          break;
        }

        console.log(
          `Payment intent succeeded: ${paymentIntent.id}, processing session: ${paymentIntent.metadata.sessionId}`
        );

        try {
          await processSuccessfulPayment(paymentIntent.metadata.sessionId);
        } catch (error) {
          console.error('Error processing payment intent:', error);
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log(`Payment failed: ${paymentIntent.id}`);

        // TODO: Handle failed payment (send email to user, log reason)

        break;
      }

      case 'account.updated': {
        // Stripe Connect account updated (creator onboarding)
        const account = event.data.object as Stripe.Account;

        console.log(`Stripe account updated: ${account.id}`);

        // Update creator's Stripe account status in database
        if (account.metadata?.userId) {
          await prisma.user.update({
            where: { id: account.metadata.userId },
            data: {
              // Store account status if needed
            },
          });
        }

        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    // 6. Return success response
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/webhook
 *
 * Stripe webhook verification endpoint.
 * Used to verify webhook URL in Stripe Dashboard.
 */
export async function GET() {
  return NextResponse.json({
    status: 'webhook endpoint active',
    timestamp: new Date().toISOString(),
  });
}
