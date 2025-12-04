
import React from 'react';

interface RoadmapPhase {
  phase: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
  items: string[];
  icon: string;
}

const roadmapPhases: RoadmapPhase[] = [
  {
    phase: 'Phase 1',
    title: 'BYOK Beta',
    status: 'current',
    icon: '🔑',
    items: [
      'Bring Your Own Key system',
      'Community recipe sharing',
      'Basic marketplace features',
      'User profiles & favorites',
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Banana Token Economy',
    status: 'upcoming',
    icon: '🍌',
    items: [
      'Banana token system launch',
      '1 Banana = 1 image generation',
      'Purchase banana bundles',
      'No API key required for users',
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Creator Marketplace',
    status: 'upcoming',
    icon: '💰',
    items: [
      'Paid premium recipes',
      'Creators earn 80% of sales',
      'Revenue dashboard for creators',
      'Tipping & creator support',
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Platform Expansion',
    status: 'upcoming',
    icon: '🚀',
    items: [
      'Mobile app launch',
      'API for developers',
      'Advanced AI models',
      'Enterprise features',
    ],
  },
];

const Roadmap: React.FC = () => {
  return (
    <section className="mt-8 mb-12">
      <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-2 transition-colors">
        <span>🗺️</span> Roadmap
      </h3>
      <p className="text-stone-500 dark:text-stone-400 mb-8 text-sm">
        Here's what we're building towards. Join us on this journey!
      </p>

      {/* Banana Economy Highlight */}
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 text-[120px] opacity-10 -mr-4 -mt-4 select-none">
          🍌
        </div>
        <div className="relative z-10">
          <div className="inline-block bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-full mb-3 uppercase tracking-wider">
            Coming Soon
          </div>
          <h4 className="text-xl font-black text-stone-900 dark:text-stone-100 mb-2">
            The Banana Token Economy
          </h4>
          <p className="text-stone-600 dark:text-stone-400 mb-4 max-w-2xl">
            Say goodbye to API keys! Soon you'll be able to purchase <strong className="text-yellow-700 dark:text-yellow-400">Banana tokens</strong> to
            generate images. Each generation costs just <strong className="text-yellow-700 dark:text-yellow-400">1 Banana</strong>.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/60 dark:bg-stone-800/60 px-3 py-2 rounded-lg">
              <span className="text-lg">🎨</span>
              <span className="font-bold text-stone-700 dark:text-stone-300">1 Banana = 1 Image</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 dark:bg-stone-800/60 px-3 py-2 rounded-lg">
              <span className="text-lg">💸</span>
              <span className="font-bold text-stone-700 dark:text-stone-300">Creators Earn 80%</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 dark:bg-stone-800/60 px-3 py-2 rounded-lg">
              <span className="text-lg">🔓</span>
              <span className="font-bold text-stone-700 dark:text-stone-300">No API Key Needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {roadmapPhases.map((phase, index) => (
          <div
            key={phase.phase}
            className={`relative rounded-xl border-2 p-5 transition-all ${
              phase.status === 'current'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600 shadow-lg shadow-yellow-100 dark:shadow-yellow-900/20'
                : phase.status === 'completed'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700'
            }`}
          >
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{phase.icon}</span>
              <span
                className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${
                  phase.status === 'current'
                    ? 'bg-yellow-400 text-yellow-900'
                    : phase.status === 'completed'
                    ? 'bg-green-400 text-green-900'
                    : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                }`}
              >
                {phase.status === 'current' ? 'In Progress' : phase.status === 'completed' ? 'Complete' : 'Upcoming'}
              </span>
            </div>

            {/* Phase Info */}
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
              {phase.phase}
            </p>
            <h4 className="font-black text-stone-900 dark:text-stone-100 mb-3">
              {phase.title}
            </h4>

            {/* Items */}
            <ul className="space-y-2">
              {phase.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400"
                >
                  <span
                    className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                      phase.status === 'current'
                        ? 'bg-yellow-500'
                        : phase.status === 'completed'
                        ? 'bg-green-500'
                        : 'bg-stone-300 dark:bg-stone-600'
                    }`}
                  />
                  {item}
                </li>
              ))}
            </ul>

            {/* Connector line for desktop */}
            {index < roadmapPhases.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-[9px] w-4 h-0.5 bg-stone-200 dark:bg-stone-700" />
            )}
          </div>
        ))}
      </div>

      {/* Creator CTA */}
      <div className="mt-8 text-center bg-stone-100 dark:bg-stone-800/50 rounded-xl p-6 border border-stone-200 dark:border-stone-700">
        <h4 className="font-black text-stone-900 dark:text-stone-100 mb-2">
          Interested in becoming a creator?
        </h4>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 max-w-lg mx-auto">
          Start building recipes now during the BYOK Beta. When the marketplace launches,
          you'll be ready to monetize your creations and earn <strong>80% of every sale</strong>.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Free to build
          </div>
          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Keep 80% of sales
          </div>
          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Build your audience now
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
