'use client';

import dynamic from 'next/dynamic';

const ChartInner = dynamic(() => import('./progress-chart-inner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
      Loading chart...
    </div>
  ),
});

interface Props {
  data: { date: string; completed: number; total: number }[];
}

export default function ProgressChart({ data }: Props) {
  return <ChartInner data={data ?? []} />;
}
