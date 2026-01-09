export default function CreatorSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Earn 70% of Every Sale. Stop Building UdemyStop Building Udemy's Fortuneapos;s Fortune.
          </h2>
          <p className="text-xl text-slate-300">
            Instructor revenue on Udemy dropped from 25% to 15% by 2026. We pay 4.7x more. Plus built-in audience.
          </p>
        </div>

        {/* Problem/Solution */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Problem */}
          <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-8">
            <h3 className="text-xl font-bold mb-4 text-red-400">The Problem:</h3>
            <blockquote className="text-slate-300 italic mb-4">
              "Udemy is earning more, paying instructors less."quot;Udemy is earning more, paying instructors less."Udemy is earning more, paying instructors less."quot;
            </blockquote>
            <p className="text-sm text-slate-400 mb-4">— Udemy Instructor Community</p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300">Revenue cuts: 25% → 20% → 17.5% → 15% (2026)</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300">250,000+ courses = impossible to stand out</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300">Quality content buried among low-quality courses</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300">You drive all the traffic, they keep most of the money</span>
              </li>
            </ul>
          </div>

          {/* Solution */}
          <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-8">
            <h3 className="text-xl font-bold mb-4 text-green-400">The DevTutorials Solution:</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300"><strong className="text-green-400">70% to you</strong> (vs. Udemy's 15-20% on subscriptions)</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300"><strong className="text-green-400">4.7x better earnings</strong> per sale</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300"><strong className="text-green-400">Curated marketplace</strong> = quality stands out</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300"><strong className="text-green-400">Built-in audience</strong> of motivated intermediate developers</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-300"><strong className="text-green-400">Quality environment</strong> protects your reputation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">$13.30</div>
            <p className="text-slate-300 mb-4">from a $19 sale (vs. $1.90-3.70 on Udemy)</p>
            <ul className="text-sm text-slate-400 space-y-2">
              <li>• $19 sale: You keep $13.30</li>
              <li>• 100 sales: $1,330 in your pocket</li>
              <li>• No monthly platform fees</li>
            </ul>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">5,000+</div>
            <p className="text-slate-300 mb-4">developers and growing</p>
            <ul className="text-sm text-slate-400 space-y-2">
              <li>• Targeted audience</li>
              <li>• Intermediate devs actively seeking learning</li>
              <li>• Featured placement opportunities</li>
            </ul>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">Your Way</div>
            <p className="text-slate-300 mb-4">Teach your way. No platform mandates.</p>
            <ul className="text-sm text-slate-400 space-y-2">
              <li>• Project-based format</li>
              <li>• Control pricing within bands</li>
              <li>• Direct learner relationship</li>
            </ul>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-slate-800/50 rounded-xl p-8 mb-12 border border-slate-700">
          <blockquote className="text-lg text-slate-300 italic mb-4">
            "I moved my top 5 courses from Udemy to DevTutorials. My revenue tripled in the first month. The 70% split + curated audience = no-brainer."quot;I moved my top 5 courses from Udemy to DevTutorials. My revenue tripled in the first month. The 70% split + curated audience = no-brainer."I moved my top 5 courses from Udemy to DevTutorials. My revenue tripled in the first month. The 70% split + curated audience = no-brainer."quot;
          </blockquote>
          <footer className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-xl font-bold text-white">FM</span>
            </div>
            <div>
              <p className="font-semibold text-white">Frank M.</p>
              <p className="text-sm text-slate-400">Full-Stack Creator, Former Udemy Instructor</p>
            </div>
          </footer>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-lg">
            Apply to Become a Creator
          </button>
          <p className="mt-4 text-sm text-slate-400">
            Takes 5 minutes • Get approved in 48 hours
          </p>
        </div>
      </div>
    </section>
  );
}
