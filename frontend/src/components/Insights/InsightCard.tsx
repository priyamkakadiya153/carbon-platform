/**
 * InsightCard — Single carbon reduction action card.
 *
 * Accessibility features:
 *   - <article> with descriptive aria-label
 *   - Priority badge is visually prominent and screen-reader legible
 *   - Category icon decorative (aria-hidden)
 */

import type { InsightItem } from '../../types';
import { formatKg, getCategoryIcon, formatCategory } from '../../utils/formatters';

interface InsightCardProps {
  insight: InsightItem;
  index: number;
  committed?: boolean;
  onToggle?: () => void;
}

const priorityColors = [
  'bg-emerald-600 dark:bg-emerald-500',
  'bg-emerald-500 dark:bg-emerald-500/80',
  'bg-teal-500 dark:bg-teal-500/80',
];

export const InsightCard = ({ insight, index, committed = false, onToggle }: InsightCardProps) => {
  const icon = getCategoryIcon(insight.category);
  const categoryLabel = formatCategory(insight.category);
  const saving = formatKg(insight.estimated_saving_kg);
  const badgeColor = priorityColors[index] ?? priorityColors[2];

  return (
    <article
      aria-label={`Insight ${index + 1}: ${categoryLabel} — ${insight.action}`}
      className={`
        bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border shadow-sm p-5
        hover:shadow-md transition-all duration-300 animate-fade-in relative overflow-hidden
        focus-within:ring-2 focus-within:ring-emerald-500/20
        ${
          committed
            ? 'border-emerald-500 dark:border-emerald-500/60 ring-2 ring-emerald-500/10 dark:ring-emerald-500/5 bg-emerald-50/10 dark:bg-emerald-950/5'
            : 'border-gray-200/60 dark:border-slate-800/60 hover:border-emerald-350 dark:hover:border-emerald-800'
        }
      `}
    >
      {/* Decorative commitment indicator strip */}
      {committed && (
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-500 dark:bg-emerald-400" />
      )}

      <div className="flex items-start gap-4">
        {/* Priority Badge */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <span
            className={`
              ${badgeColor} text-white text-xs font-bold
              w-8 h-8 rounded-full flex items-center justify-center
              shadow-sm
            `}
            aria-label={`Priority ${insight.priority}`}
          >
            {insight.priority}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Category header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">
                {icon}
              </span>
              <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
                {categoryLabel}
              </span>
            </div>

            {/* Commit Checkbox Indicator */}
            {onToggle && (
              <div className="flex items-center gap-1.5 relative z-20">
                <input
                  type="checkbox"
                  id={`commit-${index}`}
                  checked={committed}
                  onChange={onToggle}
                  className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 text-emerald-600 dark:text-emerald-500 focus:ring-emerald-500 accent-emerald-500 dark:accent-emerald-400 cursor-pointer"
                />
                <label
                  htmlFor={`commit-${index}`}
                  className="text-xs font-bold text-gray-500 dark:text-slate-400 hidden sm:inline cursor-pointer before:absolute before:inset-0"
                >
                  <span className="sr-only">Commit to {insight.action}</span>
                  {committed ? 'Committed' : 'Commit'}
                </label>
              </div>
            )}
          </div>

          {/* Action text */}
          <p className="text-sm text-gray-700 dark:text-slate-250 leading-relaxed mb-3 font-medium">
            {insight.action}
          </p>

          {/* Metrics row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Saving */}
            <div className="flex items-center gap-1.5 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 rounded-lg px-3 py-1.5">
              <span aria-hidden="true">💚</span>
              <span className="text-xs font-bold">Save ~{saving} CO₂e/year</span>
            </div>

            {/* Timeframe */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-lg px-3 py-1.5">
              <span aria-hidden="true">⏱</span>
              <span className="text-xs font-semibold">{insight.timeframe}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
