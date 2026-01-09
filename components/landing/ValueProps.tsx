export default function ValueProps() {
  const values = [
    {
      title: 'Quality You Can Trust',
      badge: 'Expert-Created',
      points: [
        'Every creator vetted (5+ years professional experience)',
        'Working code included (no abandoned projects)',
        'Peer-reviewed before publication',
        'Average rating: 4.7/5 from 1,200+ reviews',
      ],
    },
    {
      title: '6-Month Freshness Guarantee',
      badge: 'Updated or Your Money Back',
      points: [
        'All tutorials updated within 6 months or removed',
        '"Updated This Week" badge on fresh content',
        'Free lifetime updates for purchased tutorials',
        'Email alerts when your tutorials update',
      ],
    },
    {
      title: 'Build Portfolio-Worthy Projects',
      badge: 'Project-Based',
      points: [
        'Real-world projects (not toy apps)',
        'Production-quality code you can deploy',
        'Source code included (Git repo)',
        'Complete in one weekend (3-10 hours)',
      ],
    },
    {
      title: 'Own Your Education. No Subscriptions.',
      badge: 'One-Time Purchase',
      points: [
        'One-time purchases ($9-29)',
        'Lifetime access',
        'No monthly fees',
        'Stop paying for content you don\'t use',
      ],
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Why Developers Switch to DevTutorials
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {value.title}
                </h3>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full flex-shrink-0 ml-2">
                  {value.badge}
                </span>
              </div>
              <ul className="space-y-3">
                {value.points.map((point, i) => (
                  <li key={i} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
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

        {/* Social Proof Quote */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 md:p-12 text-white">
          <svg
            className="w-12 h-12 opacity-50 mb-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote className="text-xl md:text-2xl font-medium mb-4">
            "I wasted $200 on Udemy courses with outdated code. DevTutorials' freshness guarantee saved me from another bad purchase. The React state management tutorial paid for itself 10x in my first week."
          </blockquote>
          <footer className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
              <span className="text-xl font-bold">SK</span>
            </div>
            <div>
              <p className="font-semibold">Sarah K.</p>
              <p className="text-sm opacity-90">Frontend Developer</p>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
