import EmailCapture from '@/components/landing/EmailCapture';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-24 lg:pt-32 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
                Finally, Tutorials for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                  Intermediate Developers
                </span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
                Build portfolio-worthy projects in one weekend. No subscription required.
              </p>
              <p className="text-base text-slate-500 dark:text-slate-400">
                Escape tutorial hell with project-based learning designed for intermediate developers. Every tutorial updated within 6 months—guaranteed.
              </p>
            </div>

            {/* Email Capture Form */}
            <EmailCapture source="hero-landing-page" className="max-w-lg" />

            {/* Secondary CTA */}
            <div>
              <a
                href="#creators"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Become a Creator - Earn 70%
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Social Proof */}
            <div className="pt-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Join <span className="font-semibold text-slate-900 dark:text-white">5,000+</span> developers advancing their careers
              </p>
            </div>
          </div>

          {/* Right: Visual Mockup */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
              {/* Mockup Interface */}
              <div className="bg-white dark:bg-slate-950 rounded-lg shadow-lg p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                      Updated This Week
                    </span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                      Expert-Vetted
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-50 dark:bg-slate-900 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">4.8/5</span>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">2,300+ reviews</span>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-blue-600 to-violet-600 text-white px-6 py-3 rounded-xl shadow-xl">
                <p className="text-sm font-semibold">6-Month</p>
                <p className="text-xs opacity-90">Freshness Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
