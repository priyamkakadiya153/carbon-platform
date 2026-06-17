/**
 * HistoryTable — Full accessible sortable table of carbon history entries.
 *
 * Accessibility features:
 *   - <table> with <caption>
 *   - <th scope="col"> for column headers
 *   - <th scope="row"> for date column
 *   - "View Details" button expands insights inline via aria-expanded
 *   - aria-controls links button to the expanded region
 */

import { Fragment, useState } from 'react';
import type { HistoryEntry } from '../../types';
import { formatCategory, formatDate, formatKg, getCategoryIcon } from '../../utils/formatters';

interface HistoryTableProps {
  history: HistoryEntry[];
}

const CATEGORY_COLORS: Record<string, string> = {
  transport: 'bg-blue-500 dark:bg-blue-400',
  home: 'bg-orange-500 dark:bg-orange-400',
  diet: 'bg-emerald-500 dark:bg-emerald-450',
  consumption: 'bg-purple-500 dark:bg-purple-400',
  general: 'bg-slate-500 dark:bg-slate-400',
};

const ExpandedDetailsPanel = ({ entry, id }: { entry: HistoryEntry; id: string }) => {
  return (
    <div
      id={id}
      role="region"
      aria-label={`Detailed breakdown and insights for entry from ${formatDate(entry.timestamp)}`}
      className="bg-slate-50/50 dark:bg-slate-950/35 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-5 mt-2.5 transition-colors duration-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Category Breakdown Micro-bars */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-150 dark:border-slate-800/60 pb-2">
            Emission Breakdown
          </p>
          <div className="space-y-3">
            {entry.ranked_categories && entry.ranked_categories.length > 0 ? (
              entry.ranked_categories.map((cat) => {
                const colorClass = CATEGORY_COLORS[cat.category] ?? CATEGORY_COLORS.general;
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-700 dark:text-slate-350 flex items-center gap-1.5">
                        <span aria-hidden="true">{getCategoryIcon(cat.category)}</span>
                        <span>{formatCategory(cat.category)}</span>
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white tabular-nums">
                        {formatKg(cat.kg)}{' '}
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">
                          ({cat.percentage.toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-350 ${colorClass}`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback to raw breakdown keys if ranked_categories is missing
              Object.entries(entry.breakdown).map(([catKey, val]) => {
                const totalVal = Object.values(entry.breakdown).reduce((a, b) => a + b, 0);
                const pct = totalVal > 0 ? (val / totalVal) * 100 : 0;
                const colorClass = CATEGORY_COLORS[catKey] ?? CATEGORY_COLORS.general;
                return (
                  <div key={catKey} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-700 dark:text-slate-350 flex items-center gap-1.5">
                        <span aria-hidden="true">{getCategoryIcon(catKey)}</span>
                        <span>{formatCategory(catKey)}</span>
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white tabular-nums">
                        {formatKg(val)}{' '}
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">
                          ({pct.toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-350 ${colorClass}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Original saved insights */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-150 dark:border-slate-800/60 pb-2">
            Reduction Recommendations
          </p>
          {!entry.insights || entry.insights.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-slate-500 italic mt-2">No insights archived with this calculation.</p>
          ) : (
            <ol className="space-y-2.5 list-none m-0 p-0">
              {entry.insights.map((insight, i) => (
                <li 
                  key={i} 
                  className="bg-white/60 dark:bg-slate-900/40 border border-gray-200/60 dark:border-slate-800/60 p-3 rounded-xl flex gap-3 text-xs leading-relaxed"
                >
                  <span aria-hidden="true" className="text-lg flex-shrink-0 mt-0.5">
                    {getCategoryIcon(insight.category)}
                  </span>
                  <div className="flex-1">
                    <span className="block font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                      {formatCategory(insight.category)} action
                    </span>
                    <p className="text-gray-600 dark:text-slate-350 mt-0.5 font-medium">{insight.action}</p>
                    <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-350 font-bold px-2 py-0.5 rounded mt-1.5">
                      Save ~{formatKg(insight.estimated_saving_kg)}/year
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

      </div>
    </div>
  );
};

export const HistoryTable = ({ history }: HistoryTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (history.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-slate-800/40 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <caption className="sr-only">
            Carbon footprint history entries, ordered newest first
          </caption>
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-900/80 border-b border-gray-100 dark:border-slate-800/70">
              <th
                scope="col"
                className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-4 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Total CO₂e
              </th>
              <th
                scope="col"
                className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell"
              >
                Top Source
              </th>
              <th
                scope="col"
                className="px-4 py-3.5 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider"
              >
                Breakdown & Insights
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
            {history.map(entry => {
              const topCategory =
                entry.ranked_categories?.[0]?.category ?? Object.keys(entry.breakdown)[0] ?? '—';
              const isExpanded = expandedId === entry.id;
              const expandId = `expand-${entry.id}`;

              return (
                <Fragment key={entry.id}>
                  <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-100">
                    <th scope="row" className="px-4 py-3 font-semibold text-gray-800 dark:text-slate-300 text-left">
                      {formatDate(entry.timestamp)}
                    </th>
                    <td className="px-4 py-3 text-right font-black text-gray-900 dark:text-white tabular-nums">
                      {formatKg(entry.total_kg)}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-gray-700 dark:text-slate-350 px-2.5 py-1 rounded-full border border-gray-150 dark:border-slate-700/50 font-bold">
                        <span aria-hidden="true">{getCategoryIcon(topCategory)}</span>
                        {formatCategory(topCategory)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleExpand(entry.id)}
                        aria-expanded={isExpanded}
                        aria-controls={expandId}
                        aria-label={`${isExpanded ? 'Collapse' : 'View'} detailed breakdown for entry from ${formatDate(entry.timestamp)}`}
                        className="
                          text-xs text-primary-600 dark:text-primary-400 font-bold
                          hover:text-primary-800 dark:hover:text-primary-300 focus:outline-none
                          focus:ring-2 focus:ring-primary-500 rounded px-2.5 py-1.5
                          transition-colors duration-150 bg-gray-50/50 dark:bg-slate-850 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200/60 dark:border-slate-800
                        "
                      >
                        {isExpanded ? '▲ Hide' : '▼ Expand'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={4} className="px-4 pb-4 bg-slate-50/10 dark:bg-slate-900/10">
                        <ExpandedDetailsPanel entry={entry} id={expandId} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
