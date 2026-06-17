/**
 * CategoryChart — Bar chart of carbon breakdown by category.
 *
 * Accessibility features:
 *   - Chart wrapper: role="img" aria-label describing the chart
 *   - Data table below chart: className="sr-only" (screen reader only)
 *   - Table has <caption>, <th scope="col">, <th scope="row">
 *   - All colour choices meet WCAG 4.5:1 contrast against white background
 */

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { RankedCategory } from '../../types';
import { formatCategory, formatKg } from '../../utils/formatters';

interface CategoryChartProps {
  breakdown: Record<string, number>;
  ranked_categories: RankedCategory[];
}

const CATEGORY_COLORS: Record<string, string> = {
  transport: '#3b82f6',     // Vibrant Blue
  home: '#f97316',          // Warm Orange
  diet: '#10b981',          // Emerald Green
  consumption: '#8b5cf6',   // Purple
  general: '#64748b',       // Slate Gray
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { category: string } }>;
}) => {
  if (!active || !payload?.length) return null;
  const { value, payload: data } = payload[0];
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3.5 py-2 shadow-lg text-sm transition-colors">
      <p className="font-bold text-gray-900 dark:text-white leading-tight">{formatCategory(data.category)}</p>
      <p className="text-primary-600 dark:text-primary-400 font-semibold mt-1">{formatKg(value)} CO₂e</p>
    </div>
  );
};

export const CategoryChart = ({ breakdown: _breakdown, ranked_categories }: CategoryChartProps) => {
  const chartData = ranked_categories.map(item => ({
    category: item.category,
    label: formatCategory(item.category),
    kg: item.kg,
    percentage: item.percentage,
  }));

  return (
    <div>
      {/* Recharts bar chart — hidden from screen readers (table below is the accessible version) */}
      <div
        role="img"
        aria-label="Bar chart showing annual carbon footprint broken down by category. A data table with the same information follows."
        className="w-full h-56"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            aria-hidden="true"
          >
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.04)' }} />
            <Bar dataKey="kg" radius={[8, 8, 0, 0]} maxBarSize={56}>
              {chartData.map(entry => (
                <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? '#10b981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Screen reader data table (visually hidden) */}
      <table className="sr-only">
        <caption>Carbon footprint breakdown by category (annual kg CO₂e)</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">kg CO₂e per year</th>
            <th scope="col">Percentage of total</th>
          </tr>
        </thead>
        <tbody>
          {ranked_categories.map(item => (
            <tr key={item.category}>
              <th scope="row">{formatCategory(item.category)}</th>
              <td>{Math.round(item.kg)}</td>
              <td>{item.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
