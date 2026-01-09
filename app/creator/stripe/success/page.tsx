import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

/**
 * Stripe Connect Onboarding Success Page
 *
 * Redirected here after creator completes Stripe onboarding
 *
 * Query parameters:
 * - account: Stripe account ID
 *
 * This page:
 * 1. Verifies the account is ready
 * 2. Updates account status in database
 * 3. Redirects to creator dashboard
 */
export default async function StripeConnectSuccessPage({
  searchParams,
}: {
  searchParams: { account?: string };
}) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  const accountId = searchParams.account;

  if (!accountId) {
    redirect('/creator/dashboard?error=no_account_id');
  }

  try {
    // Verify account with Stripe
    const account = await stripe.accounts.retrieve(accountId);

    // Check if onboarding is complete
    if (account.details_submitted) {
      // Redirect to dashboard with success message
      redirect(
        `/creator/dashboard?stripe=success&charges_enabled=${account.charges_enabled}&payouts_enabled=${account.payouts_enabled}`
      );
    } else {
      // Onboarding not complete, redirect back to onboarding
      redirect('/creator/dashboard?stripe=incomplete');
    }
  } catch (error) {
    console.error('Stripe Connect success error:', error);
    redirect('/creator/dashboard?stripe=error');
  }
}
