import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateCreatorShare,
  calculatePlatformFee,
} from '@/lib/stripe';

/**
 * Purchase Service Tests
 *
 * Tests payment calculation logic.
 * Full integration tests require Stripe test environment.
 */

describe('Payment Calculations', () => {
  describe('calculateCreatorShare', () => {
    it('calculates 70% share for $9 tutorial', () => {
      const priceCents = 900; // $9.00
      const expectedShare = 630; // $6.30
      expect(calculateCreatorShare(priceCents)).toBe(expectedShare);
    });

    it('calculates 70% share for $19 tutorial', () => {
      const priceCents = 1900; // $19.00
      const expectedShare = 1330; // $13.30
      expect(calculateCreatorShare(priceCents)).toBe(expectedShare);
    });

    it('calculates 70% share for $29 tutorial', () => {
      const priceCents = 2900; // $29.00
      const expectedShare = 2030; // $20.30
      expect(calculateCreatorShare(priceCents)).toBe(expectedShare);
    });

    it('rounds correctly for odd amounts', () => {
      const priceCents = 999; // $9.99
      const expectedShare = 699; // $6.993 → $6.99
      expect(calculateCreatorShare(priceCents)).toBe(expectedShare);
    });
  });

  describe('calculatePlatformFee', () => {
    it('calculates 30% fee for $9 tutorial', () => {
      const priceCents = 900; // $9.00
      const expectedFee = 270; // $2.70
      expect(calculatePlatformFee(priceCents)).toBe(expectedFee);
    });

    it('calculates 30% fee for $19 tutorial', () => {
      const priceCents = 1900; // $19.00
      const expectedFee = 570; // $5.70
      expect(calculatePlatformFee(priceCents)).toBe(expectedFee);
    });

    it('calculates 30% fee for $29 tutorial', () => {
      const priceCents = 2900; // $29.00
      const expectedFee = 870; // $8.70
      expect(calculatePlatformFee(priceCents)).toBe(expectedFee);
    });

    it('rounds correctly for odd amounts', () => {
      const priceCents = 999; // $9.99
      const expectedFee = 300; // $2.997 → $3.00
      expect(calculatePlatformFee(priceCents)).toBe(expectedFee);
    });
  });

  describe('Revenue Split Validation', () => {
    it('creator share + platform fee equals total price', () => {
      const prices = [900, 1900, 2900, 999, 1499];

      prices.forEach((priceCents) => {
        const creatorShare = calculateCreatorShare(priceCents);
        const platformFee = calculatePlatformFee(priceCents);
        const total = creatorShare + platformFee;

        expect(total).toBe(priceCents);
      });
    });
  });
});
