'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { ProviderResult } from '@/types';
import { getLatencyBarColor } from '@/lib/utils';

interface LatencyChartProps {
  results: ProviderResult[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { name: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const { name } = payload[0].payload;
  const val = payload[0].value;

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl px-3.5 py-2.5 shadow-2xl text-sm">
      <p className="text-secondary font-medium">{name}</p>
      <p className="text-white font-bold font-mono mt-0.5">
        {val}
        <span className="text-muted font-normal text-xs ml-1">ms avg</span>
      </p>
    </div>
  );
}

export function LatencyChart({ results }: LatencyChartProps) {
  const data = results
    .filter((r) => r.avgMs !== null)
    .map((r) => ({
      name: r.provider.shortName,
      avg: r.avgMs ?? 0,
      color: getLatencyBarColor(r.avgMs),
    }));

  if (data.length === 0) return null;

  const avg = Math.round(data.reduce((s, d) => s + d.avg, 0) / data.length);

  return (
    <div className="p-4 rounded-xl bg-surface-800 border border-surface-600">
      <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-4">
        Average Latency (ms)
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 8, left: -10, bottom: 60 }}
          barSize={28}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            interval={0}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            unit="ms"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine
            y={avg}
            stroke="rgba(99,102,241,0.5)"
            strokeDasharray="4 4"
            label={{
              value: `avg ${avg}ms`,
              fill: '#818cf8',
              fontSize: 10,
              position: 'right',
            }}
          />
          <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} fillOpacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
