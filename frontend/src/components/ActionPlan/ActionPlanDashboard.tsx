import { useCarbonStore } from '../../store/carbonStore';
import { formatKg, getCategoryIcon, formatCategory } from '../../utils/formatters';

interface Badge {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  unlocked: boolean;
}

export const ActionPlanDashboard = () => {
  const result = useCarbonStore(s => s.result);
  const history = useCarbonStore(s => s.history);
  const committedActions = useCarbonStore(s => s.committedActions);
  const toggleActionComplete = useCarbonStore(s => s.toggleActionComplete);
  const uncommitAction = useCarbonStore(s => s.uncommitAction);
  const simulatedOffsetPct = useCarbonStore(s => s.simulatedOffsetPct);
  const setStep = useCarbonStore(s => s.setStep);

  // 1. Establish the current baseline footprint
  const baselineKg = result 
    ? result.total_kg 
    : (history.length > 0 ? history[0].total_kg : 0);

  const baselineBreakdown = result 
    ? result.breakdown 
    : (history.length > 0 ? history[0].breakdown : null);

  // 2. Calculate savings metrics
  const completedSavings = committedActions.reduce((acc, curr) => {
    return acc + (curr.completed ? curr.estimated_saving_kg : 0);
  }, 0);

  const netProjected = Math.max(0, baselineKg - completedSavings);
  const progressPct = baselineKg > 0 ? (completedSavings / baselineKg) * 100 : 0;

  // 3. Evaluate Badges Achievements
  const badges: Badge[] = [
    {
      id: 'champion',
      emoji: '🌟',
      title: 'Climate Champion',
      desc: 'Annual footprint is under the Paris 1.5°C limit (2,000 kg).',
      unlocked: baselineKg > 0 && baselineKg <= 2000,
    },
    {
      id: 'defender',
      emoji: '🌿',
      title: 'Eco Defender',
      desc: 'Annual footprint is below the global average (4,000 kg).',
      unlocked: baselineKg > 0 && baselineKg <= 4000,
    },
    {
      id: 'commuter',
      emoji: '🚲',
      title: 'Green Commuter',
      desc: 'Minimal transport emissions (under 500 kg CO₂e).',
      unlocked: baselineBreakdown !== null && (baselineBreakdown.transport ?? 0) <= 500 && (baselineBreakdown.transport ?? 0) > 0,
    },
    {
      id: 'plant',
      emoji: '🥗',
      title: 'Plant Power',
      desc: 'Dietary pattern is vegetarian or vegan.',
      unlocked: baselineBreakdown !== null && (baselineBreakdown.diet ?? 0) <= 1200, // Vegan: 900kg, Veg: 1200kg, Med: 2000kg
    },
    {
      id: 'waste',
      emoji: '🛍️',
      title: 'Zero Waste',
      desc: 'Minimal shopping emissions (under 600 kg CO₂e).',
      unlocked: baselineBreakdown !== null && (baselineBreakdown.consumption ?? 0) <= 600, // Low: 600kg, Med: 1000kg, High: 2000kg
    },
    {
      id: 'offset',
      emoji: '🌍',
      title: 'Net Zero Hero',
      desc: 'Model 100% carbon neutrality in the Offset Simulator.',
      unlocked: simulatedOffsetPct === 100,
    },
    {
      id: 'cutter',
      emoji: '✂️',
      title: 'Carbon Cutter',
      desc: 'Complete at least 2 carbon-reduction action commitments.',
      unlocked: committedActions.filter(a => a.completed).length >= 2,
    },
    {
      id: 'consistent',
      emoji: '📅',
      title: 'Consistency Champ',
      desc: 'Record at least 3 carbon calculations in history.',
      unlocked: history.length >= 3,
    },
  ];

  return (
    <div className="space-y-8 animate-slide-up relative z-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold font-display text-gray-900 dark:text-white mb-1">
          My Carbon Action Plan
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          Commit to green lifestyle choices, track your completed actions, and earn achievement badges!
        </p>
      </div>

      {/* Main Grid: Checklist & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Checklist */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-slate-800/40 p-5 space-y-4">
            <h3 className="text-sm font-bold font-display text-gray-800 dark:text-white flex items-center gap-1.5 border-b border-gray-100 dark:border-slate-800 pb-2.5">
              <span>📋</span> Active Commitments ({committedActions.length})
            </h3>

            {committedActions.length === 0 ? (
              <div className="text-center py-10 space-y-3.5">
                <span className="text-4xl block" aria-hidden="true">🌱</span>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                  You have not committed to any carbon reduction actions yet.
                </p>
                <button
                  onClick={() => setStep(result ? 'results' : 'form')}
                  className="bg-primary-200 hover:bg-primary-300 dark:bg-primary-600 dark:hover:bg-primary-500 text-slate-955 dark:text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                  {result ? 'Go to Calculations Results' : 'Calculate Carbon Footprint'}
                </button>
              </div>
            ) : (
              <ul className="space-y-3.5 list-none m-0 p-0">
                {committedActions.map((action, idx) => (
                  <li 
                    key={idx}
                    className={`
                      flex items-start justify-between gap-3.5 p-4 rounded-xl border transition-all duration-300
                      ${action.completed 
                        ? 'border-emerald-250 bg-emerald-50/15 dark:border-emerald-900/40 dark:bg-emerald-950/5 opacity-85'
                        : 'border-gray-150 dark:border-slate-800 bg-white/50 dark:bg-slate-850/40'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Completion check */}
                      <button
                        onClick={() => toggleActionComplete(action.action)}
                        className={`
                          w-5 h-5 rounded-full border flex items-center justify-center transition-all flex-shrink-0 mt-0.5
                          ${action.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-slate-500'
                          }
                        `}
                        aria-label={action.completed ? 'Mark action as incomplete' : 'Mark action as completed'}
                      >
                        {action.completed && <span className="text-xs font-black">✓</span>}
                      </button>

                      <div className="space-y-1 text-left flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
                          <span aria-hidden="true">{getCategoryIcon(action.category)}</span>
                          {formatCategory(action.category)}
                        </span>
                        <p className={`text-xs font-semibold leading-relaxed ${action.completed ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-700 dark:text-slate-205'}`}>
                          {action.action}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50/40 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                            Save ~{formatKg(action.estimated_saving_kg)}/year
                          </span>
                          <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500">
                            ⏱ {action.timeframe}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => uncommitAction(action.action)}
                      className="text-[10px] font-bold text-gray-400 hover:text-red-500 dark:hover:text-red-400 px-2 py-1 rounded transition-colors self-start focus:outline-none"
                      aria-label={`Remove action: ${action.action}`}
                    >
                      ✕ Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right 1 Col: Scorecard & Dashboard */}
        <div className="space-y-5">
          {/* Action Metrics Card */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-slate-800/40 p-5 space-y-4">
            <h3 className="text-sm font-bold font-display text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-2.5">
              📊 Plan Impact
            </h3>

            {baselineKg === 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-500 italic text-center py-4">
                Calculate footprint to see baseline metrics.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3.5 text-center">
                  <div className="bg-slate-50/50 dark:bg-slate-950/30 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800/60">
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase">Baseline</span>
                    <span className="text-base font-black text-gray-700 dark:text-slate-350 tabular-nums">
                      {formatKg(baselineKg)}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-slate-950/30 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800/60">
                    <span className="block text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase">Net Footprint</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-450 tabular-nums">
                      {formatKg(netProjected)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 font-sans">
                  <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-slate-400">
                    <span>Footprint Reduced</span>
                    <span className="text-emerald-600 dark:text-emerald-400">-{progressPct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, progressPct)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-slate-550 italic leading-tight">
                    You have achieved a reduction of <strong>{formatKg(completedSavings)} CO₂e/year</strong> from your checklist!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Gamified Eco-Badge Achievement Board */}
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-slate-800/40 p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold font-display text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-150 dark:border-slate-800 pb-3 leading-tight">
            <span aria-hidden="true" className="text-lg">🏆</span> Eco Achievements Board
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            Unlock sustainable badges based on your lifestyle choices, calculations history, and reduction goals!
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              className={`
                border rounded-2xl p-4 text-center flex flex-col items-center justify-between transition-all duration-300 relative overflow-hidden group
                ${badge.unlocked 
                  ? 'border-emerald-400/40 bg-emerald-50/10 dark:bg-emerald-950/5 ring-4 ring-emerald-500/5 dark:ring-emerald-500/3 hover:scale-[1.03]'
                  : 'border-gray-200/60 bg-gray-50/40 dark:border-slate-850 dark:bg-slate-900/10 opacity-55 hover:opacity-75'
                }
              `}
            >
              {badge.unlocked && (
                <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_50%)]" />
              )}
              
              <span className={`text-4xl block mb-2.5 transform transition-transform group-hover:scale-110 duration-200 ${badge.unlocked ? '' : 'filter grayscale opacity-50'}`}>
                {badge.emoji}
              </span>
              
              <div className="space-y-1">
                <span className={`block text-xs font-black font-display leading-tight ${badge.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>
                  {badge.title}
                </span>
                <span className="block text-[9px] text-gray-500 dark:text-slate-450 leading-normal font-sans px-1">
                  {badge.desc}
                </span>
              </div>

              <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-3 leading-none ${
                badge.unlocked 
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-550/20' 
                  : 'bg-gray-200/60 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
              }`}>
                {badge.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
