/**
 * HistoryChart — Line chart showing carbon footprint trend over time.
 *
 * Accessibility features:
 *   - role="img" with aria-label on chart wrapper
 *   - Accessible data table below (sr-only)
 *   - Empty state with role="status"
 *   - Up/down arrows with aria-label for trend indicators in table
 */

import {
  CartesianGrid,
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { HistoryEntry } from '../../types';
import { formatDate, formatKg } from '../../utils/formatters';

interface HistoryChartProps {
  history: HistoryEntry[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3.5 py-2 shadow-lg text-sm transition-colors">
      <p className="text-gray-500 dark:text-slate-400 text-xs mb-1 font-medium">{label}</p>
      <p className="font-bold text-gray-900 dark:text-white text-base">{formatKg(payload[0].value)} CO₂e</p>
    </div>
  );
};

export const HistoryChart = ({ history }: HistoryChartProps) => {
  if (history.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-slate-800/40 p-10 text-center shadow-sm">
        <div className="text-5xl mb-4" aria-hidden="true">
          📈
        </div>
        <p role="status" className="text-gray-500 dark:text-slate-400 font-medium">
          No history yet. Calculate your footprint to start tracking your progress over time.
        </p>
      </div>
    );
  }

  // Display oldest → newest for the trend line
  const chartData = [...history].reverse().map(entry => ({
    date: formatDate(entry.timestamp),
    kg: entry.total_kg,
  }));

  return (
    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-slate-800/40 p-6 space-y-4 shadow-sm">
      <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-150 dark:border-slate-800 pb-3">
        <span aria-hidden="true" className="text-lg">📈</span> Footprint Trend
      </h3>

      {/* Recharts area chart */}
      <div
        role="img"
        aria-label="Area chart showing carbon footprint trend over time. A data table with the same information follows."
        className="w-full h-56"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="historyGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800/40" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => formatKg(v)}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="kg"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#historyGlow)"
              dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#059669' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Screen reader accessible data table */}
      <table className="sr-only">
        <caption>Carbon footprint history — date and total CO₂e emissions</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Total CO₂e (kg)</th>
            <th scope="col">Change vs previous</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((entry, i) => {
            const prev = chartData[i - 1];
            const diff = prev ? entry.kg - prev.kg : null;
            const trendLabel =
              diff === null
                ? 'First entry'
                : diff > 0
                  ? `Up ${formatKg(Math.abs(diff))}`
                  : diff < 0
                    ? `Down ${formatKg(Math.abs(diff))}`
                    : 'No change';
            return (
              <tr key={i}>
                <th scope="row">{entry.date}</th>
                <td>{Math.round(entry.kg)}</td>
                <td>{trendLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
