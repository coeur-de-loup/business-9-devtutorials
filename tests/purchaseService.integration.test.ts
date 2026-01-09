import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createPurchaseIntent,
  processSuccessfulPayment,
  getUserPurchases,
  userOwnsTutorial,
  getCreatorEarnings,
  markEarningsAsPaid,
  getPurchaseBySessionId,
} from '@/lib/services/purchaseService';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

/**
 * Purchase Service Integration Tests
 *
 * Tests business logic for purchases, payments, and creator earnings.
 * Uses test database with mocked Stripe API.
 */

// Mock Stripe
vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    },
  },
  createCheckoutSession: vi.fn(),
  getCheckoutSession: vi.fn(),
}));

describe('Purchase Service', () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.purchase.deleteMany({});
    await prisma.creatorEarning.deleteMany({});
    await prisma.tutorial.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.purchase.deleteMany({});
    await prisma.creatorEarning.deleteMany({});
    await prisma.tutorial.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('createPurchaseIntent', () => {
    it('creates checkout session for valid purchase', async () => {
      // Setup test data
      const creator = await prisma.user.create({
        data: {
          id: 'creator-1',
          name: 'Test Creator',
          email: 'creator@test.com',
          stripeAccountId: 'acct_test123',
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
          price: 1900, // $19.00
          status: 'PUBLISHED',
          creatorId: creator.id,
          stripeAccountId: creator.stripeAccountId!,
          videoUrl: 'https://test.com/video',
          duration: 60,
        },
      });

      // Mock Stripe response
      const mockSession = {
        id: 'cs_test123',
        url: 'https://checkout.stripe.com/pay/cs_test123',
      };

      vi.mocked(createCheckoutSession).mockResolvedValue(mockSession as any);

      // Execute
      const result = await createPurchaseIntent({
        userId: user.id,
        tutorialId: tutorial.id,
        tutorialTitle: tutorial.title,
        price: tutorial.price,
        creatorAccountId: creator.stripeAccountId!,
        userEmail: user.email!,
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/tutorials/' + tutorial.id,
      });

      // Verify
      expect(result).toEqual({
        checkoutUrl: mockSession.url,
        sessionId: mockSession.id,
      });

      expect(createCheckoutSession).toHaveBeenCalledWith({
        tutorialId: tutorial.id,
        tutorialTitle: tutorial.title,
        price: tutorial.price,
        creatorAccountId: creator.stripeAccountId,
        userId: user.id,
        userEmail: user.email,
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/tutorials/' + tutorial.id,
      });
    });

    it('throws error when tutorial not found', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'user-1',
          name: 'Test User',
          email: 'user@test.com',
        },
      });

      await expect(
        createPurchaseIntent({
          userId: user.id,
          tutorialId: 'nonexistent-tutorial',
          tutorialTitle: 'Nonexistent',
          price: 1900,
          creatorAccountId: 'acct_test123',
          userEmail: user.email!,
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/tutorials/xxx',
        })
      ).rejects.toThrow('Tutorial not found');
    });

    it('throws error when tutorial not published', async () => {
      const creator = await prisma.user.create({
        data: {
          id: 'creator-1',
          name: 'Test Creator',
          email: 'creator@test.com',
          stripeAccountId: 'acct_test123',
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
          title: 'Draft Tutorial',
          description: 'A draft tutorial',
          price: 1900,
          status: 'DRAFT', // Not published
          creatorId: creator.id,
          stripeAccountId: creator.stripeAccountId!,
          videoUrl: 'https://test.com/video',
          duration: 60,
        },
      });

      await expect(
        createPurchaseIntent({
          userId: user.id,
          tutorialId: tutorial.id,
          tutorialTitle: tutorial.title,
          price: tutorial.price,
          creatorAccountId: creator.stripeAccountId!,
          userEmail: user.email!,
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/tutorials/' + tutorial.id,
        })
      ).rejects.toThrow('Tutorial is not available for purchase');
    });

    it('throws error when user already owns tutorial', async () => {
      const creator = await prisma.user.create({
        data: {
          id: 'creator-1',
          name: 'Test Creator',
          email: 'creator@test.com',
          stripeAccountId: 'acct_test123',
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
          stripeAccountId: creator.stripeAccountId!,
          videoUrl: 'https://test.com/video',
          duration: 60,
        },
      });

      // Create existing purchase
      await prisma.purchase.create({
        data: {
          id: 'purchase-1',
          userId: user.id,
          tutorialId: tutorial.id,
          amount: tutorial.price,
          stripeSessionId: 'cs_existing',
        },
      });

      await expect(
        createPurchaseIntent({
          userId: user.id,
          tutorialId: tutorial.id,
          tutorialTitle: tutorial.title,
          price: tutorial.price,
          creatorAccountId: creator.stripeAccountId!,
          userEmail: user.email!,
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/tutorials/' + tutorial.id,
        })
      ).rejects.toThrow('You already own this tutorial');
    });

    it('throws error when creator account not configured', async () => {
      const creator = await prisma.user.create({
        data: {
          id: 'creator-1',
          name: 'Test Creator',
          email: 'creator@test.com',
          // No stripeAccountId
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
          // No stripeAccountId
          videoUrl: 'https://test.com/video',
          duration: 60,
        },
      });

      await expect(
        createPurchaseIntent({
          userId: user.id,
          tutorialId: tutorial.id,
          tutorialTitle: tutorial.title,
          price: tutorial.price,
          creatorAccountId: '', // Empty
          userEmail: user.email!,
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/tutorials/' + tutorial.id,
        })
      ).rejects.toThrow('Creator payment account not configured');
    });
  });

  describe('processSuccessfulPayment', () => {
    it('creates purchase and creator earnings records', async () => {
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
          price: 1900, // $19.00
          status: 'PUBLISHED',
          creatorId: creator.id,
          videoUrl: 'https://test.com/video',
          duration: 60,
        },
      });

      // Mock Stripe session
      const mockSession = {
        id: 'cs_test123',
        metadata: {
          tutorialId: tutorial.id,
          userId: user.id,
        },
        amount_total: tutorial.price,
      };

      vi.mocked(getCheckoutSession).mockResolvedValue(mockSession as any);

      // Execute
      const result = await processSuccessfulPayment(mockSession.id);

      // Verify purchase created
      expect(result.purchase).toMatchObject({
        userId: user.id,
        tutorialId: tutorial.id,
        amount: tutorial.price,
        stripeSessionId: mockSession.id,
      });

      // Verify creator earnings (70% of $19.00 = $13.30)
      expect(result.creatorEarning).toMatchObject({
        creatorId: creator.id,
        tutorialId: tutorial.id,
        purchaseId: result.purchase.id,
        amount: 1330, // 70% of 1900 cents
        paidOut: false,
      });

      // Verify records in database
      const purchaseCount = await prisma.purchase.count();
      expect(purchaseCount).toBe(1);

      const earningsCount = await prisma.creatorEarning.count();
      expect(earningsCount).toBe(1);
    });

    it('returns existing records for idempotent webhook', async () => {
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

      // Create existing purchase and earnings
      const existingPurchase = await prisma.purchase.create({
        data: {
          id: 'purchase-1',
          userId: user.id,
          tutorialId: tutorial.id,
          amount: tutorial.price,
          stripeSessionId: 'cs_test123',
        },
      });

      const existingEarning = await prisma.creatorEarning.create({
        data: {
          id: 'earning-1',
          creatorId: creator.id,
          tutorialId: tutorial.id,
          purchaseId: existingPurchase.id,
          amount: 1330,
          paidOut: false,
        },
      });

      // Mock Stripe session
      const mockSession = {
        id: 'cs_test123',
        metadata: {
          tutorialId: tutorial.id,
          userId: user.id,
        },
      };

      vi.mocked(getCheckoutSession).mockResolvedValue(mockSession as any);

      // Execute
      const result = await processSuccessfulPayment(mockSession.id);

      // Verify existing records returned (no duplicates)
      expect(result.purchase.id).toBe(existingPurchase.id);
      expect(result.creatorEarning.id).toBe(existingEarning.id);

      // Verify no new records created
      const purchaseCount = await prisma.purchase.count();
      expect(purchaseCount).toBe(1);
    });

    it('throws error when session metadata missing', async () => {
      const mockSession = {
        id: 'cs_test123',
        metadata: {}, // No tutorialId or userId
      };

      vi.mocked(getCheckoutSession).mockResolvedValue(mockSession as any);

      await expect(
        processSuccessfulPayment(mockSession.id)
      ).rejects.toThrow('Invalid session metadata');
    });
  });

  describe('getUserPurchases', () => {
    it('returns empty array for user with no purchases', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'user-1',
          name: 'Test User',
          email: 'user@test.com',
        },
      });

      const purchases = await getUserPurchases(user.id);

      expect(purchases).toEqual([]);
    });

    it('returns user purchases with tutorial and creator details', async () => {
      const creator = await prisma.user.create({
        data: {
          id: 'creator-1',
          name: 'Test Creator',
          email: 'creator@test.com',
          image: 'https://test.com/avatar.jpg',
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

      await prisma.purchase.create({
        data: {
          id: 'purchase-1',
          userId: user.id,
          tutorialId: tutorial.id,
          amount: tutorial.price,
          stripeSessionId: 'cs_test123',
        },
      });

      const purchases = await getUserPurchases(user.id);

      expect(purchases).toHaveLength(1);
      expect(purchases[0]).toMatchObject({
        userId: user.id,
        tutorialId: tutorial.id,
        amount: tutorial.price,
      });
      expect(purchases[0].tutorial).toMatchObject({
        id: tutorial.id,
        title: tutorial.title,
        creator: {
          id: creator.id,
          name: creator.name,
          image: creator.image,
        },
      });
    });

    it('returns purchases ordered by creation date (newest first)', async () => {
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

      const tutorial1 = await prisma.tutorial.create({
        data: {
          id: 'tutorial-1',
          title: 'Tutorial 1',
          description: 'First tutorial',
          price: 900,
          status: 'PUBLISHED',
          creatorId: creator.id,
          videoUrl: 'https://test.com/video1',
          duration: 60,
        },
      });

      const tutorial2 = await prisma.tutorial.create({
        data: {
          id: 'tutorial-2',
          title: 'Tutorial 2',
          description: 'Second tutorial',
          price: 1900,
          status: 'PUBLISHED',
          creatorId: creator.id,
          videoUrl: 'https://test.com/video2',
          duration: 60,
        },
      });

      // Create purchases with delay
      await prisma.purchase.create({
        data: {
          id: 'purchase-1',
          userId: user.id,
          tutorialId: tutorial1.id,
          amount: tutorial1.price,
          stripeSessionId: 'cs_test1',
          createdAt: new Date('2026-01-01T10:00:00Z'),
        },
      });

      await prisma.purchase.create({
        data: {
          id: 'purchase-2',
          userId: user.id,
          tutorialId: tutorial2.id,
          amount: tutorial2.price,
          stripeSessionId: 'cs_test2',
          createdAt: new Date('2026-01-01T11:00:00Z'),
        },
      });

      const purchases = await getUserPurchases(user.id);

      expect(purchases).toHaveLength(2);
      expect(purchases[0].tutorialId).toBe(tutorial2.id); // Newest first
      expect(purchases[1].tutorialId).toBe(tutorial1.id);
    });
  });

  describe('userOwnsTutorial', () => {
    it('returns true when user owns tutorial', async () => {
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

      await prisma.purchase.create({
        data: {
          id: 'purchase-1',
          userId: user.id,
          tutorialId: tutorial.id,
          amount: tutorial.price,
          stripeSessionId: 'cs_test123',
        },
      });

      const owns = await userOwnsTutorial(user.id, tutorial.id);

      expect(owns).toBe(true);
    });

    it('returns false when user does not own tutorial', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'user-1',
          name: 'Test User',
          email: 'user@test.com',
        },
      });

      const owns = await userOwnsTutorial(user.id, 'tutorial-1');

      expect(owns).toBe(false);
    });
  });

  describe('getCreatorEarnings', () => {
    it('returns empty earnings for creator with no sales', async () => {
      const creator = await prisma.user.create({
        data: {
          id: 'creator-1',
          name: 'Test Creator',
          email: 'creator@test.com',
        },
      });

      const result = await getCreatorEarnings(creator.id);

      expect(result.earnings).toEqual([]);
      expect(result.totals).toEqual({
        totalEarnings: 0,
        paidOut: 0,
        pending: 0,
      });
    });

    it('calculates earnings totals correctly', async () => {
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

      // Create purchase and earnings
      const purchase = await prisma.purchase.create({
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
          purchaseId: purchase.id,
          amount: 1330, // 70% of $19
          paidOut: false,
        },
      });

      const result = await getCreatorEarnings(creator.id);

      expect(result.earnings).toHaveLength(1);
      expect(result.totals).toEqual({
        totalEarnings: 1330,
        paidOut: 0,
        pending: 1330,
      });
    });

    it('separates paid and pending earnings', async () => {
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

      const purchase1 = await prisma.purchase.create({
        data: {
          id: 'purchase-1',
          userId: user.id,
          tutorialId: tutorial.id,
          amount: tutorial.price,
          stripeSessionId: 'cs_test1',
        },
      });

      const purchase2 = await prisma.purchase.create({
        data: {
          id: 'purchase-2',
          userId: user.id,
          tutorialId: tutorial.id,
          amount: tutorial.price,
          stripeSessionId: 'cs_test2',
        },
      });

      // One paid, one pending
      await prisma.creatorEarning.create({
        data: {
          id: 'earning-1',
          creatorId: creator.id,
          tutorialId: tutorial.id,
          purchaseId: purchase1.id,
          amount: 1330,
          paidOut: true,
          paidAt: new Date(),
        },
      });

      await prisma.creatorEarning.create({
        data: {
          id: 'earning-2',
          creatorId: creator.id,
          tutorialId: tutorial.id,
          purchaseId: purchase2.id,
          amount: 1330,
          paidOut: false,
        },
      });

      const result = await getCreatorEarnings(creator.id);

      expect(result.totals).toEqual({
        totalEarnings: 2660, // 1330 + 1330
        paidOut: 1330,
        pending: 1330,
      });
    });
  });

  describe('markEarningsAsPaid', () => {
    it('marks multiple earnings as paid', async () => {
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

      const purchase1 = await prisma.purchase.create({
        data: {
          id: 'purchase-1',
          userId: user.id,
          tutorialId: tutorial.id,
          amount: tutorial.price,
          stripeSessionId: 'cs_test1',
        },
      });

      const purchase2 = await prisma.purchase.create({
        data: {
          id: 'purchase-2',
          userId: user.id,
          tutorialId: tutorial.id,
          amount: tutorial.price,
          stripeSessionId: 'cs_test2',
        },
      });

      const earning1 = await prisma.creatorEarning.create({
        data: {
          id: 'earning-1',
          creatorId: creator.id,
          tutorialId: tutorial.id,
          purchaseId: purchase1.id,
          amount: 1330,
          paidOut: false,
        },
      });

      const earning2 = await prisma.creatorEarning.create({
        data: {
          id: 'earning-2',
          creatorId: creator.id,
          tutorialId: tutorial.id,
          purchaseId: purchase2.id,
          amount: 1330,
          paidOut: false,
        },
      });

      // Mark as paid
      await markEarningsAsPaid([earning1.id, earning2.id], 'payout_123');

      // Verify
      const updatedEarning1 = await prisma.creatorEarning.findUnique({
        where: { id: earning1.id },
      });

      const updatedEarning2 = await prisma.creatorEarning.findUnique({
        where: { id: earning2.id },
      });

      expect(updatedEarning1?.paidOut).toBe(true);
      expect(updatedEarning1?.paidAt).not.toBeNull();
      expect(updatedEarning2?.paidOut).toBe(true);
      expect(updatedEarning2?.paidAt).not.toBeNull();
    });
  });

  describe('getPurchaseBySessionId', () => {
    it('returns purchase with full details', async () => {
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

      await prisma.purchase.create({
        data: {
          id: 'purchase-1',
          userId: user.id,
          tutorialId: tutorial.id,
          amount: tutorial.price,
          stripeSessionId: 'cs_test123',
        },
      });

      const purchase = await getPurchaseBySessionId('cs_test123');

      expect(purchase).toMatchObject({
        stripeSessionId: 'cs_test123',
        amount: tutorial.price,
        tutorial: {
          title: tutorial.title,
          creator: {
            name: creator.name,
            email: creator.email,
          },
        },
        user: {
          name: user.name,
          email: user.email,
        },
      });
    });

    it('returns null for non-existent session', async () => {
      const purchase = await getPurchaseBySessionId('cs_nonexistent');

      expect(purchase).toBeNull();
    });
  });
});
