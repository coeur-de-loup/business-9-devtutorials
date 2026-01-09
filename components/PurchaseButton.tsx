'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Purchase Button Component
 *
 * Handles tutorial purchase flow:
 * 1. Creates purchase intent via API
 * 2. Redirects to Stripe Checkout
 * 3. Returns to success page after payment
 */

interface PurchaseButtonProps {
  tutorialId: string;
  price: number; // Price in cents
  title: string;
  className?: string;
}

export function PurchaseButton({
  tutorialId,
  price,
  title,
  className = '',
}: PurchaseButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create purchase intent
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tutorialId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create purchase');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full bg-indigo-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          `Purchase for $${(price / 100).toFixed(2)}`
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <p className="mt-4 text-center text-sm text-gray-600">
        30-day money-back guarantee
      </p>
    </div>
  );
}
