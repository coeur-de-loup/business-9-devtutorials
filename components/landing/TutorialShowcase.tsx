export default function TutorialShowcase() {
  const tutorials = [
    {
      title: 'Advanced React State Management',
      type: 'Deep Dive',
      price: '$29',
      duration: '6 hours',
      description: 'Build a complete app with Zustand, React Query, and Context.',
      features: [
        'State management patterns used in production',
        'Performance optimization techniques',
        'Testing state with Jest and Testing Library',
        'Deploy to Vercel with one click',
      ],
      rating: '4.9/5',
      reviews: 234,
      creator: 'Senior Engineer at Netflix',
      updated: '2 weeks ago',
    },
    {
      title: 'Build a REST API with Node.js & PostgreSQL',
      type: 'Standard Tutorial',
      price: '$19',
      duration: '4 hours',
      description: 'Create a production-ready backend from scratch.',
      features: [
        'RESTful API design best practices',
        'PostgreSQL database schema design',
        'Authentication with JWT',
        'Docker containerization',
        'API documentation with Swagger',
      ],
      rating: '4.8/5',
      reviews: 189,
      creator: '10-year Backend Veteran',
      updated: '1 week ago',
    },
    {
      title: 'Testing React Components with Cypress',
      type: 'Quick Skill',
      price: '$9',
      duration: '2 hours',
      description: 'Learn end-to-end testing in one afternoon.',
      features: [
        'Cypress test setup and configuration',
        'Writing effective test cases',
        'CI/CD integration',
        'Test coverage reports',
      ],
      rating: '4.7/5',
      reviews: 98,
      creator: 'QA Lead at Stripe',
      updated: '5 days ago',
    },
  ];

  const categories = [
    'React & Next.js',
    'TypeScript',
    'Full-Stack',
    'Testing',
    'API Development',
    'DevOps',
    'System Design',
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Build Skills That Actually Get You Promoted
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Every tutorial is a complete, production-ready project. Add it to your portfolio. Show it to hiring managers. Get the job.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category, index) => (
            <button
              key={index}
              className="px-6 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-200"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tutorial Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {tutorials.map((tutorial, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Type Badge */}
              <div className="px-6 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                    {tutorial.type}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {tutorial.price}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {tutorial.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {tutorial.duration}
                </p>
                <p className="text-slate-700 dark:text-slate-300 mb-6">
                  {tutorial.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {tutorial.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <svg
                        className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Rating */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {tutorial.rating}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {tutorial.reviews} reviews
                  </span>
                </div>

                {/* Creator & Updated */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-6">
                  <span>{tutorial.creator}</span>
                  <span>Updated {tutorial.updated}</span>
                </div>

                {/* CTAs */}
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 text-sm">
                    Add to Cart
                  </button>
                  <button className="px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors duration-200 text-sm">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Browse All CTA */}
        <div className="text-center">
          <button className="px-8 py-4 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-lg">
            Browse All 150+ Tutorials →
          </button>
        </div>
      </div>
    </section>
  );
}
