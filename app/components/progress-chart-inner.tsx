'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface Props {
  data: { date: string; completed: number; total: number }[];
}

export default function ProgressChartInner({ data }: Props) {
  const safeData = (data ?? []).map((d) => ({
    date: formatShortDate(d?.date ?? ''),
    completed: d?.completed ?? 0,
    total: d?.total ?? 0,
  }));

  const maxVal = Math.max(...safeData.map((d) => d?.total ?? 0), 1);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={safeData}
        margin={{ top: 5, right: 10, left: 10, bottom: 40 }}
      >
        <XAxis
          dataKey="date"
          tickLine={false}
          tick={{ fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          interval="preserveStartEnd"
          label={{ value: 'Date', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <YAxis
          tickLine={false}
          tick={{ fontSize: 10 }}
          allowDecimals={false}
          domain={[0, maxVal]}
          label={{ value: 'Exercises', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        />
        <ReferenceLine y={maxVal} stroke="#d1d5db" strokeDasharray="3 3" />
        <Bar
          dataKey="completed"
          fill="#0d9488"
          radius={[4, 4, 0, 0]}
          name="Completed"
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    return `${parts?.[1] ?? ''}/${parts?.[2] ?? ''}`;
  } catch {
    return dateStr;
  }
}
