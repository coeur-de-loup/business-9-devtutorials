'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * StripeConnectButton
 *
 * Button component for creators to initiate Stripe Connect onboarding
 *
 * Usage:
 * <StripeConnectButton />
 *
 * Features:
 * - Checks account status before redirecting
 * - Shows loading states
 * - Handles errors gracefully
 * - Redirects to Stripe onboarding flow
 */
export function StripeConnectButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Initiate onboarding
      const response = await fetch('/api/stripe/connect/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if account already connected
        if (response.status === 400 && data.accountId) {
          setError(
            'Stripe account already connected. ' +
            `Charges: ${data.chargesEnabled ? '✓' : '✗'}, ` +
            `Payouts: ${data.payoutsEnabled ? '✓' : '✗'}`
          );
          return;
        }

        throw new Error(data.error || 'Failed to initiate onboarding');
      }

      // 2. Redirect to Stripe onboarding
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No onboarding URL received');
      }
    } catch (err) {
      console.error('Stripe Connect error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to connect Stripe account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleConnect}
        disabled={loading}
        className={`
          inline-flex items-center justify-center
          px-6 py-3 border border-transparent
          text-base font-medium rounded-md
          text-white bg-blurple-600 hover:bg-blurple-700
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blurple-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
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
            Connecting...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
            </svg>
            Connect Stripe Account
          </>
        )}
      </button>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Connect your Stripe account to receive payments. You'll be redirected to
        Stripe to complete onboarding.
      </p>
    </div>
  );
}
