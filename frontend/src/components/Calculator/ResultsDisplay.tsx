/**
 * ResultsDisplay — Carbon calculation results with comparisons and chart.
 *
 * Accessibility features:
 *   - <section aria-labelledby="results-heading">
 *   - aria-live="polite" so screen readers announce new results
 *   - Progress bars have aria-label with percentage and comparison target
 *   - "Get Personalized Insights" button triggers AI insights flow
 */

import { useEffect, useState } from 'react';
import { useCarbonStore } from '../../store/carbonStore';
import type { CarbonResult } from '../../types';
import { formatKg, getFootprintLabel, formatCategory } from '../../utils/formatters';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { CategoryChart } from './CategoryChart';
import { OffsetSimulator } from './OffsetSimulator';

interface ResultsDisplayProps {
  result: CarbonResult;
}

// Rolling counter animation
const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    const duration = 1000; // ms
    const increment = end / (duration / 16); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  if (value >= 1000) {
    return <span>{(displayValue / 1000).toFixed(1)}t</span>;
  }
  return <span>{Math.round(displayValue)} kg</span>;
};

// SVG Circular Gauge Component
const CircularDial = ({ pct, label, benchmarkKg }: { pct: number; label: string; benchmarkKg: number }) => {
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const clampedPct = Math.min(pct, 200);
  const strokeDashoffset = circumference - (clampedPct / 200) * circumference;
  
  const strokeColor = pct <= 50 
    ? 'stroke-emerald-550 dark:stroke-emerald-400' 
    : pct <= 100 
      ? 'stroke-primary-500 dark:stroke-primary-400' 
      : pct <= 150 
        ? 'stroke-amber-500 dark:stroke-amber-400' 
        : 'stroke-red-500 dark:stroke-red-400';

  return (
    <div className="flex flex-col items-center gap-2.5 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-gray-150 dark:border-slate-800/60 rounded-2xl flex-1 min-w-[130px]">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            className="stroke-gray-100 dark:stroke-slate-800"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            className={`${strokeColor} transition-all duration-1000 ease-out`}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <span className="absolute flex flex-col items-center">
          <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums leading-none tracking-tight">
            {pct.toFixed(0)}%
          </span>
        </span>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold text-gray-700 dark:text-slate-350">{label}</p>
        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Limit: {formatKg(benchmarkKg)}</p>
      </div>
    </div>
  );
};

const ComparisonBar = ({
  id,
  label,
  pct,
  benchmark,
  benchmarkKg,
}: {
  id: string;
  label: string;
  pct: number;
  benchmark: string;
  benchmarkKg: number;
}) => {
  const clampedPct = Math.min(pct, 200);
  const barWidth = Math.min(clampedPct / 2, 100);
  const color = pct <= 100 ? 'bg-primary-500 dark:bg-primary-400' : pct <= 150 ? 'bg-amber-500 dark:bg-amber-400' : 'bg-red-500 dark:bg-red-400';

  return (
    <div className="space-y-2 font-sans">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-gray-700 dark:text-slate-300">{label}</span>
        <span className="font-bold text-gray-900 dark:text-white">
          {pct.toFixed(0)}%{' '}
          <span className="font-normal text-gray-500 dark:text-slate-450">of {formatKg(benchmarkKg)}</span>
        </span>
      </div>
      <div
        className="relative w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={200}
        aria-label={`${label}: your footprint is ${pct.toFixed(0)}% of the ${benchmark} (${formatKg(benchmarkKg)}/year)`}
        id={id}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${barWidth}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-gray-400/50 dark:bg-slate-600 opacity-60"
          style={{ left: '50%' }}
          aria-hidden="true"
        />
      </div>
      <p className="text-xs text-gray-505 dark:text-slate-400 flex items-center gap-1.5 font-medium">
        {pct <= 100 ? (
          <>
            <span className="text-emerald-500">✅</span> You are below the {benchmark}
          </>
        ) : (
          <>
            <span className="text-amber-500">⚠️</span> You are {(pct - 100).toFixed(0)}% above the {benchmark}
          </>
        )}
      </p>
    </div>
  );
};

const getEcoGrade = (totalKg: number) => {
  if (totalKg < 2000) {
    return {
      grade: 'A',
      title: 'Climate Champion 🌟',
      desc: 'Outstanding! Your footprint is aligned with the Paris 1.5°C target limit.',
      bgClass: 'eco-grade-gradient-A',
    };
  }
  if (totalKg < 4000) {
    return {
      grade: 'B',
      title: 'Eco-Friendly Leaf 🌿',
      desc: 'Great job! You are below the global average and tracking nicely towards sustainability.',
      bgClass: 'eco-grade-gradient-B',
    };
  }
  if (totalKg < 6000) {
    return {
      grade: 'C',
      title: 'Moderate Impact ⚖️',
      desc: 'Your emissions are standard. Simple modifications can help you reach Grade B.',
      bgClass: 'eco-grade-gradient-C',
    };
  }
  if (totalKg < 8000) {
    return {
      grade: 'D',
      title: 'Above Average 🚗',
      desc: 'Your footprint is slightly high. Target your top categories to improve.',
      bgClass: 'eco-grade-gradient-D',
    };
  }
  return {
    grade: 'E',
    title: 'High Impact ⚠️',
    desc: 'Your footprint is double the global average. Check the insights below to start reducing.',
    bgClass: 'eco-grade-gradient-E',
  };
};

export const ResultsDisplay = ({ result }: ResultsDisplayProps) => {
  const fetchInsights = useCarbonStore(s => s.fetchInsights);
  const isLoadingInsights = useCarbonStore(s => s.isLoadingInsights);
  const insights = useCarbonStore(s => s.insights);

  const { label, colorClass, bgClass } = getFootprintLabel(result.vs_global_average_pct);
  const ecoRating = getEcoGrade(result.total_kg);

  // Find highest category
  const highestCategoryItem = [...result.ranked_categories].sort((a, b) => b.kg - a.kg)[0];
  const highestCategoryName = highestCategoryItem ? highestCategoryItem.category : '';

  return (
    <section
      aria-labelledby="results-heading"
      aria-live="polite"
      aria-atomic="true"
      className="space-y-6 animate-slide-up"
    >
      {/* Total Footprint Scoreboard & Eco-Grade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Footprint Card */}
        <div className="md:col-span-2 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 dark:border-slate-800/40 p-8 text-center relative overflow-hidden flex flex-col justify-center min-h-[200px] hover:border-emerald-200/50 dark:hover:border-slate-700/60 transition-all duration-300">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-600/10 dark:bg-primary-400/5 rounded-full filter blur-3xl pointer-events-none" />
          <h2 id="results-heading" className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1 relative z-10 font-display">
            Your Annual Carbon Footprint
          </h2>
          <div className="flex items-end justify-center gap-2 mb-4 relative z-10">
            <span className="text-6xl sm:text-7xl font-black font-display text-gray-900 dark:text-white tabular-nums leading-none tracking-tight">
              <AnimatedNumber value={result.total_kg} />
            </span>
            <span className="text-2xl text-gray-400 dark:text-slate-500 font-bold mb-1.5">CO₂e</span>
          </div>
          <div>
            <span
              className={`inline-flex items-center px-4.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${colorClass} ${bgClass}`}
            >
              {label}
            </span>
          </div>
        </div>

        {/* Eco-Grade Certificate Card */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 dark:border-slate-800/40 p-6 flex flex-col items-center justify-between text-center relative overflow-hidden hover:border-emerald-200/50 dark:hover:border-slate-700/60 transition-all duration-300">
          <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest font-display mb-2">
            Eco Rating
          </span>
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-4xl font-extrabold font-display shadow-lg ${ecoRating.bgClass} animate-pulse-slow`}>
            {ecoRating.grade}
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-extrabold text-gray-800 dark:text-white font-display">
              {ecoRating.title}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-slate-450 mt-1 leading-relaxed px-1">
              {ecoRating.desc}
            </p>
          </div>
        </div>

      </div>

      {/* Benchmark Comparisons - Circular Dials Dashboard */}
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-800/40 p-6 space-y-6 relative z-10">
        <h3 className="text-base font-bold font-display text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-150 dark:border-slate-800 pb-3 leading-tight">
          <span aria-hidden="true" className="text-lg">📊</span> Comparison Dashboard
        </h3>
        
        {/* Radial Gauges */}
        <div className="flex flex-wrap gap-4 justify-between">
          <CircularDial
            pct={result.vs_global_average_pct}
            label="vs Global Average"
            benchmarkKg={4000}
          />
          <CircularDial
            pct={result.vs_paris_target_pct}
            label="vs Paris 1.5°C Target"
            benchmarkKg={2000}
          />
        </div>

        {/* Detailed Horizontal progress bars */}
        <div className="space-y-4 pt-2">
          <ComparisonBar
            id="global-average-bar"
            label="Global Average Alignment"
            pct={result.vs_global_average_pct}
            benchmark="global average"
            benchmarkKg={4000}
          />
          <ComparisonBar
            id="paris-target-bar"
            label="Paris Climate Goal Alignment"
            pct={result.vs_paris_target_pct}
            benchmark="Paris climate target"
            benchmarkKg={2000}
          />
        </div>

        <p className="text-[10px] text-gray-400 dark:text-slate-500 pt-2 border-t border-gray-100 dark:border-slate-800/60 font-medium font-sans">
          Sources: Our World in Data 2023 (global average) · IPCC SR1.5 (Paris 1.5°C target limit)
        </p>
      </div>

      {/* Highest Impact Alert */}
      {highestCategoryItem && (
        <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl p-5 flex items-start gap-4 relative z-10">
          <span className="text-2xl" aria-hidden="true">💡</span>
          <div className="text-sm">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 font-display">Highest Impact Area</h4>
            <p className="text-amber-800 dark:text-slate-300 mt-1 leading-relaxed font-sans">
              Your largest source of emissions comes from <strong className="font-bold text-amber-955 dark:text-amber-250">{formatCategory(highestCategoryName)}</strong>, making up <strong className="font-bold text-amber-955 dark:text-amber-250">{highestCategoryItem.percentage.toFixed(0)}%</strong> of your total carbon output ({formatKg(highestCategoryItem.kg)} CO₂e). Targeting reductions in this category will yield your quickest path to carbon neutrality.
            </p>
          </div>
        </div>
      )}

      {/* Category Chart Breakdown */}
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-800/40 p-6 relative z-10">
        <h3 className="text-base font-bold font-display text-gray-800 dark:text-white mb-5 flex items-center gap-2 border-b border-gray-150 dark:border-slate-800 pb-3 leading-tight">
          <span aria-hidden="true" className="text-lg">🔍</span> Breakdown by Category
        </h3>
        <CategoryChart breakdown={result.breakdown} ranked_categories={result.ranked_categories} />
      </div>

      {/* Offset Simulator */}
      <OffsetSimulator />

      {/* Get Insights CTA */}
      {!insights && (
        <div className="flex justify-center pt-2 relative z-10">
          <button
            onClick={fetchInsights}
            disabled={isLoadingInsights}
            aria-busy={isLoadingInsights}
            aria-label={
              isLoadingInsights
                ? 'Loading your personalised reduction plan...'
                : 'Get personalised carbon reduction insights powered by Google Gemini AI'
            }
            className="
              flex items-center gap-3 bg-gradient-to-r from-primary-200 to-primary-300
              dark:from-primary-600 dark:to-primary-500 text-slate-950 dark:text-white px-9 py-4 rounded-2xl text-base font-bold font-display
              hover:from-primary-300 hover:to-primary-400 dark:hover:from-primary-700 dark:hover:to-primary-600 hover:scale-[1.02] active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus-visible:ring-offset-slate-950
              disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
              transition-all duration-200 shadow-lg shadow-primary-200/20 dark:shadow-none min-w-[280px] justify-center
            "
          >
            {isLoadingInsights ? (
              <LoadingSpinner label="Generating plan with Gemini..." size="sm" />
            ) : (
              <>
                <span aria-hidden="true">✨</span>
                Get Personalised Plan
                <span className="text-[10px] bg-white/20 dark:bg-slate-950/20 px-2 py-0.5 rounded-full font-bold uppercase font-display">Gemini AI</span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};
