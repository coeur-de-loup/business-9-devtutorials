import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPurchaseBySessionId } from '@/lib/services/purchaseService';

/**
 * Success Page
 *
 * Displays after successful Stripe checkout.
 * Verifies purchase and redirects to tutorial content.
 */

interface SuccessPageProps {
  searchParams: {
    session_id?: string;
  };
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { session_id } = searchParams;

  if (!session_id) {
    redirect('/tutorials');
  }

  try {
    // Fetch purchase details
    const purchase = await getPurchaseBySessionId(session_id);

    if (!purchase) {
      throw new Error('Purchase not found');
    }

    // Verify this purchase belongs to current user
    if (purchase.userId !== session.user.id) {
      throw new Error('Unauthorized');
    }

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Purchase Successful!
            </h1>

            <p className="text-center text-gray-600 mb-8">
              You now have lifetime access to this tutorial.
            </p>

            {/* Tutorial Details */}
            <div className="border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {purchase.tutorial.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                By {purchase.tutorial.creator.name}
              </p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Amount paid:</span>
                <span className="font-semibold text-gray-900">
                  ${(purchase.amount / 100).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-500">Date:</span>
                <span className="text-gray-900">
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`/tutorials/${purchase.tutorialId}/watch`}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center"
              >
                Start Learning
              </a>
              <a
                href="/my-tutorials"
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                My Tutorials
              </a>
            </div>

            {/* Receipt Info */}
            <p className="text-center text-sm text-gray-500 mt-6">
              A receipt has been sent to {session.user.email}
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading success page:', error);

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Purchase Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't verify your purchase. Please check your email for a
              confirmation.
            </p>
            <a
              href="/my-tutorials"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              View My Tutorials
            </a>
          </div>
        </div>
      </div>
    );
  }
}
