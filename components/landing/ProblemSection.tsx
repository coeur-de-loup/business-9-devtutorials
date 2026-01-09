export default function ProblemSection() {
  const problems = [
    {
      title: 'The Content Gap',
      quote: 'Either there are too few resources for intermediate developers, or they are too difficult to find.',
      source: 'Reddit, r/learnprogramming',
      points: [
        "CanCan't find resourcesapos;t find resources beyond 'hello world'",
        'Too advanced for Codecademy, can\'t afford Pluralsight',
        'Stuck at junior level, watching peers advance',
      ],
    },
    {
      title: 'The Quality Problem',
      quote: 'Frustrated with misleading tutorials and courses...expensive courses that teach only syntax without teaching how to build usable applications.',
      source: 'Developer Survey',
      points: [
        'Wasted money on outdated Udemy courses',
        'Tutorials with broken code (React 16, old syntax)',
        'No quality curation—hit or miss content',
      ],
    },
    {
      title: 'The Subscription Trap',
      quote: "I'm already paying for Frontend Masters ($39/mo), Coursera ($49/mo), and Educative ($149/yr). I can't justify another subscription.",
      source: 'Intermediate Developer',
      points: [
        'Subscription fatigue is real',
        'Paying $240-600/year across multiple platforms',
        'Want to own content, not rent it monthly',
      ],
    },
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            You're Not a Beginner Anymore. But You Don't Feel Intermediate Yet.
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Most platforms teach you syntax. We teach you to build real systems.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {problem.title}
              </h3>
              <blockquote className="text-sm text-slate-600 dark:text-slate-400 italic mb-6 border-l-4 border-blue-500 pl-4">
                {problem.quote}
                <footer className="mt-2 not-italic text-xs">— {problem.source}</footer>
              </blockquote>
              <ul className="space-y-3">
                {problem.points.map((point, i) => (
                  <li key={i} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
            There's a Better Way{' '}
            <svg
              className="w-6 h-6 inline-block animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </p>
        </div>
      </div>
    </section>
  );
}
