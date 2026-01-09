# DevTutorials Test Suite

This directory contains all tests for the DevTutorials marketplace platform.

---

## Test Structure

```
tests/
├── e2e/                          # End-to-end tests (Playwright)
│   └── purchase-flow.spec.ts     # Complete purchase journey tests
├── api/                          # API endpoint tests
│   └── purchases.test.ts         # Purchase API tests (16 tests)
├── unit/                         # Unit tests
│   └── prisma.test.ts            # Database config tests
├── purchaseService.test.ts       # Payment calculation tests (9 passing)
└── purchaseService.integration.test.ts  # Service logic tests (23 tests)
```

---

## Quick Reference

### Run All Tests

```bash
# Unit tests only
npm test

# E2E tests only
npm run test:e2e

# All tests (unit + E2E)
npm run test:all
```

### E2E Test Modes

```bash
# Headless (default)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Debug mode (step-through)
npm run test:e2e:debug

# Headed (see browser)
npm run test:e2e:headed
```

### Test Execution Script

```bash
# Automated test runner with setup checks
./scripts/test-e2e.sh

# With options
./scripts/test-e2e.sh --ui        # UI mode
./scripts/test-e2e.sh --headed    # See browser
./scripts/test-e2e.sh --debug     # Debug mode
```

---

## Test Coverage Summary

| Test Type | File | Test Count | Status |
|-----------|------|-----------|--------|
| Payment Calculations | `purchaseService.test.ts` | 9 | ✅ Passing |
| Purchase Service | `purchaseService.integration.test.ts` | 23 | 🟡 Ready (needs DB) |
| API Endpoints | `api/purchases.test.ts` | 16 | 🟡 Ready (needs DB) |
| E2E Flow | `e2e/purchase-flow.spec.ts` | 30+ | ✅ Ready |
| Database Config | `unit/prisma.test.ts` | 2 | ✅ Passing |

**Total:** 80+ tests across all levels

---

## Test Prerequisites

### 1. Environment Setup

```bash
# Copy environment file
cp .env.example .env.local

# Configure required variables
# - DATABASE_URL
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - NEXTAUTH_SECRET
```

### 2. Database Setup

```bash
# Create database
createdb devtutorials

# Run migrations
npx prisma migrate deploy

# Seed test data
npm run db:seed
```

### 3. Install Dependencies

```bash
# Install all dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

---

## E2E Testing Guide

For comprehensive E2E testing documentation, see:

📖 **[E2E Test Guide](../docs/validation/e2e-test-guide.md)**

### Quick Start for E2E Tests

1. **Start dev server**
   ```bash
   npm run dev
   ```

2. **Run E2E tests**
   ```bash
   npm run test:e2e
   ```

3. **View results**
   ```bash
   open playwright-report/index.html
   ```

### Manual Testing

For manual Stripe test mode testing, see:

📋 **[Manual Testing Checklist](../docs/validation/manual-testing-checklist.md)**

---

## Unit Testing

### Payment Calculation Tests

Tests verify 70/30 revenue split calculations:

```bash
npm test purchaseService.test.ts
```

**Covers:**
- ✅ Creator share (70%) for $9, $19, $29 tutorials
- ✅ Platform fee (30%) calculations
- ✅ Revenue split validation
- ✅ Rounding for odd amounts

### API Endpoint Tests

Tests verify API behavior:

```bash
npm test api/purchases.test.ts
```

**Covers:**
- ✅ POST /api/purchases (success + errors)
- ✅ GET /api/purchases (purchase history)
- ✅ POST /api/stripe/webhook (webhook processing)
- ✅ Authentication requirements
- ✅ Input validation
- ✅ Error handling

**Note:** These tests require database setup.

---

## Test Results

### After Running Tests

**Unit Tests:**
- Console output with pass/fail
- Coverage report (if using `--coverage`)

**E2E Tests:**
- HTML report: `playwright-report/index.html`
- Screenshots: `test-results/`
- Traces: `tests/e2e/.traces/`

### View E2E Report

```bash
# Open HTML report
open playwright-report/index.html

# View trace (for failures)
npx playwright show-trace tests/e2e/.traces/trace.zip
```

---

## Troubleshooting

### Issue: Tests fail with "Cannot find module"

**Solution:**
```bash
npm install
npx playwright install
```

### Issue: Database connection fails

**Solution:**
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux

# Create database
createdb devtutorials

# Run migrations
npx prisma migrate deploy
```

### Issue: Webhook tests fail

**Solution:**
- Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
- Login: `stripe login`
- Start webhook forwarding: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Copy webhook secret to `.env.local`

For more troubleshooting, see the [E2E Test Guide](../docs/validation/e2e-test-guide.md).

---

## Continuous Integration

### GitHub Actions Example

```yaml
- name: Run tests
  run: |
    npm run test
    npm run test:e2e
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
```

---

## Test Documentation

- **E2E Test Guide:** [docs/validation/e2e-test-guide.md](../docs/validation/e2e-test-guide.md)
- **Manual Testing Checklist:** [docs/validation/manual-testing-checklist.md](../docs/validation/manual-testing-checklist.md)
- **Validation Report:** [docs/validation/e2e-validation-report.md](../docs/validation/e2e-validation-report.md)
- **Test Plan:** [docs/validation/test-plan.md](../docs/validation/test-plan.md)
- **Previous Validation:** [docs/validation/validation-report.md](../docs/validation/validation-report.md)

---

## Writing New Tests

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/url');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.locator('[data-testid="element"]');

    // Act
    await element.click();

    // Assert
    await expect(page).toHaveURL(/.*\/expected-url/);
  });
});
```

### Unit Test Template

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature', () => {
  it('should calculate correctly', () => {
    // Arrange
    const input = 100;

    // Act
    const result = calculate(input);

    // Assert
    expect(result).toBe(70);
  });
});
```

---

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for elements** before interacting: `await expect(element).toBeVisible()`
3. **Test user behavior**, not implementation details
4. **Keep tests independent** - don't rely on test order
5. **Use beforeEach hooks** for test setup
6. **Mock external dependencies** in unit tests
7. **Test error cases** along with happy paths
8. **Use descriptive test names**: "should X when Y"

---

## Test Status

| Test Suite | Status | Last Updated |
|------------|--------|--------------|
| Payment Calculations | ✅ Passing | Jan 9, 2026 |
| Purchase Service | 🟡 Ready (needs DB) | Jan 9, 2026 |
| API Endpoints | 🟡 Ready (needs DB) | Jan 9, 2026 |
| E2E Purchase Flow | ✅ Ready | Jan 9, 2026 |

**Overall:** Ready for testing execution

---

## Next Steps

1. ✅ E2E test suite created
2. 📋 Execute automated tests: `npm run test:e2e`
3. 📋 Complete manual testing (15 scenarios)
4. 📋 Fix any failing tests
5. 📋 Close validation bead

---

**For detailed testing procedures, see:**
- [E2E Test Guide](../docs/validation/e2e-test-guide.md)
- [Manual Testing Checklist](../docs/validation/manual-testing-checklist.md)
