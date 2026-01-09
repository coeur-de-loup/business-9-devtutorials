import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';

/**
 * Stripe Connect Onboarding Refresh Page
 *
 * Redirected here when creator's onboarding link expires
 *
 * Query parameters:
 * - account: Stripe account ID (optional)
 *
 * This page:
 * 1. Creates a new onboarding link
 * 2. Redirects creator back to Stripe
 */
export default async function StripeConnectRefreshPage({
  searchParams,
}: {
  searchParams: { account?: string };
}) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  // Redirect to creator dashboard with instructions to reconnect
  redirect('/creator/dashboard?stripe=expired');
}
