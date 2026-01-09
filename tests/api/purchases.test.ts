import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST, GET } from '@/app/api/purchases/route';
import { POST as WebhookPOST } from '@/app/api/stripe/webhook/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createCheckoutSession, getCheckoutSession } from '@/lib/stripe';
import { NextRequest } from 'next/server';

/**
 * API Endpoint Tests
 *
 * Tests /api/purchases and /api/stripe/webhook endpoints.
 */

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/stripe', () => ({
  createCheckoutSession: vi.fn(),
  getCheckoutSession: vi.fn(),
}));

describe('POST /api/purchases', () => {
  beforeEach(async () => {
    await prisma.purchase.deleteMany({});
    await prisma.tutorial.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterEach(async () => {
    await prisma.purchase.deleteMany({});
    await prisma.tutorial.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('creates checkout session for authenticated user', async () => {
    // Mock authenticated user
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'user@test.com',
      },
    });

    // Setup test data
    const creator = await prisma.user.create({
      data: {
        id: 'creator-1',
        name: 'Test Creator',
        email: 'creator@test.com',
        stripeAccountId: 'acct_test123',
      },
    });

    const tutorial = await prisma.tutorial.create({
      data: {
        id: 'tutorial-1',
        title: 'Test Tutorial',
        description: 'A test tutorial',
        price: 1900,
        status: 'PUBLISHED',
        creatorId: creator.id,
        stripeAccountId: creator.stripeAccountId!,
        videoUrl: 'https://test.com/video',
        duration: 60,
      },
    });

    // Mock Stripe response
    vi.mocked(createCheckoutSession).mockResolvedValue({
      id: 'cs_test123',
      url: 'https://checkout.stripe.com/pay/cs_test123',
    } as any);

    // Create request
    const request = new NextRequest('http://localhost:3000/api/purchases', {
      method: 'POST',
      body: JSON.stringify({ tutorialId: tutorial.id }),
    });

    // Execute
    const response = await POST(request);
    const data = await response.json();

    // Verify
    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      checkoutUrl: 'https://checkout.stripe.com/pay/cs_test123',
      sessionId: 'cs_test123',
    });

    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        tutorialId: tutorial.id,
        price: tutorial.price,
        creatorAccountId: creator.stripeAccountId,
      })
    );
  });

  it('returns 401 for unauthenticated user', async () => {
    // Mock unauthenticated user
    vi.mocked(auth).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/purchases', {
      method: 'POST',
      body: JSON.stringify({ tutorialId: 'tutorial-1' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toMatchObject({
      error: 'Authentication required',
    });
  });

  it('returns 400 for invalid tutorial ID', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'user@test.com',
      },
    });

    const request = new NextRequest('http://localhost:3000/api/purchases', {
      method: 'POST',
      body: JSON.stringify({ tutorialId: 'invalid-cuid' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid request body');
  });

  it('returns 404 for non-existent tutorial', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'user@test.com',
      },
    });

    const request = new NextRequest('http://localhost:3000/api/purchases', {
      method: 'POST',
      body: JSON.stringify({ tutorialId: 'clx1234567890abcdefghijklmnop' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toMatchObject({
      error: 'Tutorial not found',
    });
  });

  it('returns 400 for unpublished tutorial', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'user@test.com',
      },
    });

    const creator = await prisma.user.create({
      data: {
        id: 'creator-1',
        name: 'Test Creator',
        email: 'creator@test.com',
        stripeAccountId: 'acct_test123',
      },
    });

    const tutorial = await prisma.tutorial.create({
      data: {
        id: 'tutorial-1',
        title: 'Draft Tutorial',
        description: 'A draft tutorial',
        price: 1900,
        status: 'DRAFT',
        creatorId: creator.id,
        stripeAccountId: creator.stripeAccountId!,
        videoUrl: 'https://test.com/video',
        duration: 60,
      },
    });

    const request = new NextRequest('http://localhost:3000/api/purchases', {
      method: 'POST',
      body: JSON.stringify({ tutorialId: tutorial.id }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toMatchObject({
      error: 'Tutorial is not available for purchase',
    });
  });

  it('returns 400 when user already owns tutorial', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'user@test.com',
      },
    });

    const creator = await prisma.user.create({
      data: {
        id: 'creator-1',
        name: 'Test Creator',
        email: 'creator@test.com',
        stripeAccountId: 'acct_test123',
      },
    });

    const tutorial = await prisma.tutorial.create({
      data: {
        id: 'tutorial-1',
        title: 'Test Tutorial',
        description: 'A test tutorial',
        price: 1900,
        status: 'PUBLISHED',
        creatorId: creator.id,
        stripeAccountId: creator.stripeAccountId!,
        videoUrl: 'https://test.com/video',
        duration: 60,
      },
    });

    // Create existing purchase
    await prisma.purchase.create({
      data: {
        id: 'purchase-1',
        userId: 'user-1',
        tutorialId: tutorial.id,
        amount: tutorial.price,
        stripeSessionId: 'cs_existing',
      },
    });

    const request = new NextRequest('http://localhost:3000/api/purchases', {
      method: 'POST',
      body: JSON.stringify({ tutorialId: tutorial.id }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toMatchObject({
      error: 'You already own this tutorial',
    });
  });

  it('returns 400 when creator account not configured', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'user@test.com',
      },
    });

    const creator = await prisma.user.create({
      data: {
        id: 'creator-1',
        name: 'Test Creator',
        email: 'creator@test.com',
        // No stripeAccountId
      },
    });

    const tutorial = await prisma.tutorial.create({
      data: {
        id: 'tutorial-1',
        title: 'Test Tutorial',
        description: 'A test tutorial',
        price: 1900,
        status: 'PUBLISHED',
        creatorId: creator.id,
        // No stripeAccountId
        videoUrl: 'https://test.com/video',
        duration: 60,
      },
    });

    const request = new NextRequest('http://localhost:3000/api/purchases', {
      method: 'POST',
      body: JSON.stringify({ tutorialId: tutorial.id }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toMatchObject({
      error: 'This tutorial is not ready for purchase',
    });
  });
});

describe('GET /api/purchases', () => {
  beforeEach(async () => {
    await prisma.purchase.deleteMany({});
    await prisma.tutorial.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterEach(async () => {
    await prisma.purchase.deleteMany({});
    await prisma.tutorial.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('returns purchases for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'user@test.com',
      },
    });

    const creator = await prisma.user.create({
      data: {
        id: 'creator-1',
        name: 'Test Creator',
        email: 'creator@test.com',
        image: 'https://test.com/avatar.jpg',
      },
    });

    const tutorial = await prisma.tutorial.create({
      data: {
        id: 'tutorial-1',
        title: 'Test Tutorial',
        description: 'A test tutorial',
        price: 1900,
        status: 'PUBLISHED',
        creatorId: creator.id,
        videoUrl: 'https://test.com/video',
        duration: 60,
      },
    });

    await prisma.purchase.create({
      data: {
        id: 'purchase-1',
        userId: 'user-1',
        tutorialId: tutorial.id,
        amount: tutorial.price,
        stripeSessionId: 'cs_test123',
      },
    });

    const request = new NextRequest('http://localhost:3000/api/purchases');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.purchases).toHaveLength(1);
    expect(data.purchases[0]).toMatchObject({
      userId: 'user-1',
      tutorialId: tutorial.id,
      amount: tutorial.price,
    });
  });

  it('returns empty array for user with no purchases', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'user@test.com',
      },
    });

    const request = new NextRequest('http://localhost:3000/api/purchases');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.purchases).toEqual([]);
  });

  it('returns 401 for unauthenticated user', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/purchases');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toMatchObject({
      error: 'Authentication required',
    });
  });
});

describe('POST /api/stripe/webhook', () => {
  beforeEach(async () => {
    await prisma.purchase.deleteMany({});
    await prisma.creatorEarning.deleteMany({});
    await prisma.tutorial.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterEach(async () => {
    await prisma.purchase.deleteMany({});
    await prisma.creatorEarning.deleteMany({});
    await prisma.tutorial.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('processes checkout.session.completed event', async () => {
    // Setup test data
    const creator = await prisma.user.create({
      data: {
        id: 'creator-1',
        name: 'Test Creator',
        email: 'creator@test.com',
      },
    });

    const user = await prisma.user.create({
      data: {
        id: 'user-1',
        name: 'Test User',
        email: 'user@test.com',
      },
    });

    const tutorial = await prisma.tutorial.create({
      data: {
        id: 'tutorial-1',
        title: 'Test Tutorial',
        description: 'A test tutorial',
        price: 1900,
        status: 'PUBLISHED',
        creatorId: creator.id,
        videoUrl: 'https://test.com/video',
        duration: 60,
      },
    });

    // Mock Stripe session
    const mockSession = {
      id: 'cs_test123',
      payment_status: 'paid',
      metadata: {
        tutorialId: tutorial.id,
        userId: user.id,
      },
    };

    vi.mocked(getCheckoutSession).mockResolvedValue(mockSession as any);

    // Mock constructWebhookEvent
    const { constructWebhookEvent } = await import('@/lib/stripe');
    vi.spyOn(require('@/lib/stripe'), 'constructWebhookEvent').mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: mockSession },
    });

    // Create webhook request
    const payload = JSON.stringify({
      type: 'checkout.session.completed',
      data: { object: mockSession },
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: payload,
      headers: {
        'stripe-signature': 'test_signature',
      },
    });

    // Mock environment variable
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

    // Execute
    const response = await WebhookPOST(request);

    // Verify
    expect(response.status).toBe(200);

    // Verify records created
    const purchaseCount = await prisma.purchase.count();
    expect(purchaseCount).toBe(1);

    const earningsCount = await prisma.creatorEarning.count();
    expect(earningsCount).toBe(1);

    // Cleanup
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it('returns 401 for invalid webhook signature', async () => {
    const { constructWebhookEvent } = await import('@/lib/stripe');
    vi.spyOn(require('@/lib/stripe'), 'constructWebhookEvent').mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({ type: 'test' }),
      headers: {
        'stripe-signature': 'invalid_signature',
      },
    });

    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

    const response = await WebhookPOST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid signature');

    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it('returns 400 when signature is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({ type: 'test' }),
    });

    const response = await WebhookPOST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No signature provided');
  });

  it('returns 500 when webhook secret not configured', async () => {
    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({ type: 'test' }),
      headers: {
        'stripe-signature': 'test_signature',
      },
    });

    // Ensure webhook secret is not set
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const response = await WebhookPOST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Webhook not configured');
  });

  it('handles idempotent webhook (duplicate event)', async () => {
    // Setup
    const creator = await prisma.user.create({
      data: {
        id: 'creator-1',
        name: 'Test Creator',
        email: 'creator@test.com',
      },
    });

    const user = await prisma.user.create({
      data: {
        id: 'user-1',
        name: 'Test User',
        email: 'user@test.com',
      },
    });

    const tutorial = await prisma.tutorial.create({
      data: {
        id: 'tutorial-1',
        title: 'Test Tutorial',
        description: 'A test tutorial',
        price: 1900,
        status: 'PUBLISHED',
        creatorId: creator.id,
        videoUrl: 'https://test.com/video',
        duration: 60,
      },
    });

    // Create existing purchase
    const existingPurchase = await prisma.purchase.create({
      data: {
        id: 'purchase-1',
        userId: user.id,
        tutorialId: tutorial.id,
        amount: tutorial.price,
        stripeSessionId: 'cs_test123',
      },
    });

    await prisma.creatorEarning.create({
      data: {
        id: 'earning-1',
        creatorId: creator.id,
        tutorialId: tutorial.id,
        purchaseId: existingPurchase.id,
        amount: 1330,
        paidOut: false,
      },
    });

    // Mock session
    const mockSession = {
      id: 'cs_test123',
      payment_status: 'paid',
      metadata: {
        tutorialId: tutorial.id,
        userId: user.id,
      },
    };

    vi.mocked(getCheckoutSession).mockResolvedValue(mockSession as any);

    const { constructWebhookEvent } = await import('@/lib/stripe');
    vi.spyOn(require('@/lib/stripe'), 'constructWebhookEvent').mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: mockSession },
    });

    const payload = JSON.stringify({
      type: 'checkout.session.completed',
      data: { object: mockSession },
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: payload,
      headers: {
        'stripe-signature': 'test_signature',
      },
    });

    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

    // Execute
    const response = await WebhookPOST(request);

    // Verify no duplicates created
    const purchaseCount = await prisma.purchase.count();
    expect(purchaseCount).toBe(1); // Still only 1

    const earningsCount = await prisma.creatorEarning.count();
    expect(earningsCount).toBe(1); // Still only 1

    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  it('skips unpaid sessions', async () => {
    const mockSession = {
      id: 'cs_test123',
      payment_status: 'unpaid', // Not paid
      metadata: {
        tutorialId: 'tutorial-1',
        userId: 'user-1',
      },
    };

    const { constructWebhookEvent } = await import('@/lib/stripe');
    vi.spyOn(require('@/lib/stripe'), 'constructWebhookEvent').mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: mockSession },
    });

    const payload = JSON.stringify({
      type: 'checkout.session.completed',
      data: { object: mockSession },
    });

    const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body: payload,
      headers: {
        'stripe-signature': 'test_signature',
      },
    });

    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

    const response = await WebhookPOST(request);

    expect(response.status).toBe(200);

    // Verify no records created
    const purchaseCount = await prisma.purchase.count();
    expect(purchaseCount).toBe(0);

    delete process.env.STRIPE_WEBHOOK_SECRET;
  });
});
