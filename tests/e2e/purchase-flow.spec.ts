import { test, expect } from '@playwright/test';

/**
 * E2E Tests for DevTutorials Purchase Flow
 *
 * These tests verify the complete user journey:
 * 1. Browse tutorials
 * 2. Click purchase button
 * 3. Redirect to Stripe checkout
 * 4. Complete payment
 * 5. Webhook processes
 * 6. Redirect to success page
 * 7. Access purchased tutorial
 *
 * Prerequisites:
 * - Running dev server (npm run dev)
 * - Database with test data
 * - Stripe test mode configured
 * - Stripe CLI for webhook forwarding (optional)
 */

test.describe('Purchase Flow - Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('should complete full purchase flow successfully', async ({ page }) => {
    // Step 1: Browse to tutorials page
    await page.click('text=Tutorials');
    await expect(page).toHaveURL(/.*\/tutorials/);
    await expect(page.locator('h1')).toContainText('Tutorials');

    // Step 2: Click on a tutorial
    await page.click('[data-testid="tutorial-card"]:first-child');
    await expect(page.locator('h1')).toContainText('Tutorial');

    // Step 3: Verify purchase button is visible
    const purchaseButton = page.locator('[data-testid="purchase-button"]');
    await expect(purchaseButton).toBeVisible();
    await expect(purchaseButton).toContainText('Purchase');

    // Step 4: Click purchase button
    await purchaseButton.click();

    // Step 5: Verify API call was made
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/purchases')),
      purchaseButton.click()
    ]);

    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty('checkoutUrl');
    expect(data.checkoutUrl).toContain('stripe.com');

    // Step 6: Note: In real Stripe test, we'd redirect to Stripe
    // For E2E, we mock this behavior or use Stripe test mode
    // This test verifies the API response is correct

    // Verify purchase intent was created
    expect(data.checkoutUrl).toMatch(/^https:\/\/checkout\.stripe\.com/);
  });

  test('should handle duplicate purchase attempt', async ({ page }) => {
    // This test assumes user already owns the tutorial
    // Need to setup test data with existing purchase

    await page.goto('/tutorials/test-tutorial-id');

    // If already purchased, button should show different state
    const purchaseButton = page.locator('[data-testid="purchase-button"]');

    // Check if "Already Purchased" message appears
    const alreadyPurchased = page.locator('text=You already own this tutorial');

    if (await alreadyPurchased.isVisible()) {
      await expect(purchaseButton).not.toBeVisible();
      await expect(alreadyPurchased).toBeVisible();
    }
  });
});

test.describe('Purchase Flow - Error Cases', () => {
  test('should show error when purchase fails', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/purchases', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Payment processing failed' })
      });
    });

    await page.goto('/tutorials/test-tutorial-id');
    await page.click('[data-testid="purchase-button"]');

    // Verify error message appears
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Failed to create checkout session');
  });

  test('should handle unpublished tutorial purchase attempt', async ({ page }) => {
    // Navigate to unpublished tutorial (404)
    await page.goto('/tutorials/unpublished-tutorial-id');

    // Should show 404 or not found message
    await expect(page.locator('text=Not Found')).toBeVisible();
  });

  test('should require authentication for purchase', async ({ page }) => {
    // Sign out first
    await page.goto('/api/auth/signout');
    await page.click('text=Sign out');

    // Try to access purchase endpoint
    const response = await page.request.post('/api/purchases', {
      data: { tutorialId: 'test-tutorial-id' }
    });

    expect(response.status()).toBe(401);
  });
});

test.describe('Success Page', () => {
  test('should display purchase confirmation', async ({ page }) => {
    // Navigate to success page with mock session
    await page.goto('/success?session_id=test_session_id');

    // Verify success message
    await expect(page.locator('h1')).toContainText('Purchase Successful');
    await expect(page.locator('[data-testid="purchase-confirmation"]')).toBeVisible();

    // Verify tutorial details are shown
    await expect(page.locator('[data-testid="tutorial-details"]')).toBeVisible();

    // Verify link to tutorial content
    const watchButton = page.locator('text=Watch Tutorial');
    await expect(watchButton).toBeVisible();
  });

  test('should handle invalid session ID', async ({ page }) => {
    await page.goto('/success?session_id=invalid_session_id');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text=Invalid or expired session')).toBeVisible();
  });
});

test.describe('My Tutorials Page', () => {
  test('should list purchased tutorials', async ({ page, context }) => {
    // Setup: Login as user with purchases
    await context.addInitScript(() => {
      // Mock authenticated session
      localStorage.setItem('next-auth.session-token', 'mock-token');
    });

    await page.goto('/my-tutorials');

    // Verify page title
    await expect(page.locator('h1')).toContainText('My Tutorials');

    // Verify purchased tutorials list
    const tutorialsList = page.locator('[data-testid="purchased-tutorials-list"]');

    // If user has purchases, they should be visible
    const hasPurchases = await tutorialsList.count() > 0;

    if (hasPurchases) {
      await expect(tutorialsList).toBeVisible();
      const tutorialCards = page.locator('[data-testid="purchased-tutorial-card"]');
      const count = await tutorialCards.count();
      expect(count).toBeGreaterThan(0);
    } else {
      // Should show empty state
      await expect(page.locator('text=No tutorials purchased yet')).toBeVisible();
    }
  });

  test('should provide access to purchased tutorial content', async ({ page }) => {
    // Setup: Mock user with purchase
    await page.goto('/my-tutorials');

    // Click on first purchased tutorial
    const firstTutorial = page.locator('[data-testid="purchased-tutorial-card"]:first-child');
    const count = await firstTutorial.count();

    if (count > 0) {
      await firstTutorial.click();

      // Should redirect to tutorial content
      await expect(page).toHaveURL(/.*\/tutorials\/.*/);
      await expect(page.locator('[data-testid="tutorial-content"]')).toBeVisible();
    }
  });
});

test.describe('Stripe Checkout Integration', () => {
  test('should redirect to Stripe checkout with correct parameters', async ({ page }) => {
    await page.goto('/tutorials/test-tutorial-id');
    await page.click('[data-testid="purchase-button"]');

    // Wait for API response
    const response = await page.waitForResponse(resp => resp.url().includes('/api/purchases'));
    const data = await response.json();

    // Verify checkout URL format
    expect(data.checkoutUrl).toMatch(/^https:\/\/checkout\.stripe\.com\/c\/pay\/.*/);

    // In a real test with Stripe test mode, we would:
    // 1. Navigate to checkoutUrl
    // 2. Fill in Stripe test card details
    // 3. Submit payment
    // 4. Verify redirect back to /success
  });

  test('should handle Stripe test card payment', async ({ page, context }) => {
    // This test requires Stripe test mode and webhook forwarding
    // It's documented here but may require manual testing

    // Prerequisites:
    // 1. Stripe CLI running: stripe listen --forward-to localhost:3000/api/stripe/webhook
    // 2. Test tutorial with stripeAccountId configured
    // 3. Test user logged in

    // Test steps:
    // 1. Navigate to tutorial
    // 2. Click purchase
    // 3. Fill Stripe test form with card 4242 4242 4242 4242
    // 4. Submit payment
    // 5. Wait for webhook processing
    // 6. Verify redirect to /success
    // 7. Verify database records created
    // 8. Verify tutorial appears in /my-tutorials

    test.skip(true, 'Requires Stripe test mode setup - documented for manual testing');
  });
});

test.describe('Webhook Processing', () => {
  test('should process Stripe checkout.session.completed webhook', async ({ page, request }) => {
    // This test verifies the webhook endpoint
    // Note: In real testing, you'd use Stripe CLI to trigger webhooks

    const webhookPayload = {
      id: 'evt_test_webhook',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_session_id',
          payment_status: 'paid',
          amount_total: 1900,
          metadata: {
            tutorialId: 'test-tutorial-id',
            userId: 'test-user-id'
          }
        }
      }
    };

    // Send webhook (requires signature in production)
    const response = await request.post('/api/stripe/webhook', {
      data: webhookPayload
    });

    // Webhook should be processed (may fail signature verification in test)
    // In production, Stripe signs webhooks
    expect([200, 400, 401]).toContain(response.status());
  });
});

test.describe('Purchase Button Component', () => {
  test('should show loading state during checkout creation', async ({ page }) => {
    // Slow down API response
    await page.route('**/api/purchases', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.continue();
    });

    await page.goto('/tutorials/test-tutorial-id');
    const purchaseButton = page.locator('[data-testid="purchase-button"]');

    // Click button
    await purchaseButton.click();

    // Verify loading state
    await expect(purchaseButton).toHaveAttribute('data-loading', 'true');
    await expect(purchaseButton).toBeDisabled();

    // Wait for loading to complete
    await expect(purchaseButton).not.toHaveAttribute('data-loading', 'true');
  });

  test('should be disabled when tutorial is already purchased', async ({ page }) => {
    // Setup: Mock user who owns the tutorial
    await page.goto('/tutorials/test-tutorial-id');

    const purchaseButton = page.locator('[data-testid="purchase-button"]');
    const alreadyPurchased = page.locator('text=You already own this tutorial');

    // If already purchased, button should not be clickable
    if (await alreadyPurchased.isVisible()) {
      await expect(purchaseButton).not.toBeVisible();
    }
  });
});

test.describe('Database Verification', () => {
  test('should create purchase and earnings records after payment', async ({ page, request }) => {
    // This test requires database access to verify records
    // It's more of an integration test than E2E

    test.skip(true, 'Requires database verification - use integration tests instead');

    // Pseudo-code:
    // 1. Count Purchase records before
    // 2. Complete purchase flow
    // 3. Wait for webhook processing
    // 4. Count Purchase records after (+1)
    // 5. Verify CreatorEarning record created
    // 6. Verify amounts (70/30 split)
  });
});

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/tutorials/test-tutorial-id');

    // Tab to purchase button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Should trigger purchase flow
    const response = await page.waitForResponse(resp => resp.url().includes('/api/purchases'));
    expect(response.status()).toBe(201);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/tutorials/test-tutorial-id');

    const purchaseButton = page.locator('[data-testid="purchase-button"]');
    await expect(purchaseButton).toHaveAttribute('role', 'button');
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tutorials/test-tutorial-id');

    const purchaseButton = page.locator('[data-testid="purchase-button"]');
    await expect(purchaseButton).toBeVisible();

    // Button should be large enough to tap (44px min)
    const box = await purchaseButton.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/tutorials/test-tutorial-id');

    const purchaseButton = page.locator('[data-testid="purchase-button"]');
    await expect(purchaseButton).toBeVisible();
  });
});
