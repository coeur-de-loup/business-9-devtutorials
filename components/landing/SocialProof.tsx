export default function SocialProof() {
  const stats = [
    { value: '5,000+', label: 'Developers Learning' },
    { value: '50+', label: 'Expert Creators' },
    { value: '4.7/5', label: 'Average Rating' },
    { value: '6-Month', label: 'Freshness Guarantee' },
  ];

  return (
    <section className="bg-white dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
