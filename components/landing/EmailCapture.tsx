'use client';

import { useState, FormEvent } from 'react';

interface EmailCaptureProps {
  source?: string;
  className?: string;
}

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function EmailCapture({ source = 'landing-page', className = '' }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('loading');
    setMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormState('success');
        setMessage('🎉 You\'re in! We\'ll notify you when we launch.');
        setEmail('');
      } else if (response.status === 409) {
        setFormState('error');
        setMessage('You\'re already on the waitlist! 🎉');
      } else {
        setFormState('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setFormState('error');
      setMessage('Network error. Please check your connection and try again.');
    }

    // Reset form state after 5 seconds
    setTimeout(() => {
      if (formState === 'success' || formState === 'error') {
        setFormState('idle');
        setMessage('');
      }
    }, 5000);
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={formState === 'loading'}
            className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            type="submit"
            disabled={formState === 'loading' || formState === 'success'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {formState === 'loading' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Joining...
              </span>
            ) : formState === 'success' ? (
              '✓ Joined!'
            ) : (
              'Join Waitlist'
            )}
          </button>
        </div>

        {message && (
          <div
            className={`text-sm font-medium p-3 rounded-lg ${
              formState === 'success'
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
            }`}
          >
            {message}
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          No spam, ever. Unsubscribe anytime. We'll email you when we launch.
        </p>
      </form>
    </div>
  );
}
