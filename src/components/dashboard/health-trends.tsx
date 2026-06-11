'use client';

import { useState } from 'react';
import { cx } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { LineChartView } from '@/components/charts/line-chart';

interface TrendLog {
  ts: Date | string;
  hr: number;
  spo2: number;
  temp: number;
  steps: number;
}

interface Tab {
  key: 'hr' | 'spo2' | 'temp' | 'steps';
  label: string;
  unit: string;
  color: string;
  fmt: (v: number) => string | number;
}

const TABS: Tab[] = [
  { key: 'hr', label: 'Heart Rate', unit: 'BPM', color: '#1A6B3C', fmt: (v) => v },
  { key: 'spo2', label: 'SpO2', unit: '%', color: '#0EA5E9', fmt: (v) => v },
  { key: 'temp', label: 'Temperature', unit: '°C', color: '#F59E0B', fmt: (v) => v },
  { key: 'steps', label: 'Steps', unit: '', color: '#7C3AED', fmt: (v) => (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v) },
];

export function HealthTrends({ logs }: { logs: TrendLog[] }) {
  const [tab, setTab] = useState<Tab>(TABS[0]);
  const sorted = [...logs].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  const data = sorted.map((l) => ({ ts: l.ts, value: l[tab.key] }));

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SectionTitle icon="activity" title="Health Trends" sub="Last 14 days" />
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 overflow-x-auto vw-scroll">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t)}
              className={cx('whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors', tab.key === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <LineChartView
          data={data}
          color={tab.color}
          unit={tab.unit}
          valueFmt={tab.fmt}
          seriesKey={tab.key}
          refLine={tab.key === 'hr' ? { value: 100, label: 'Upper Normal', color: '#F59E0B' } : null}
        />
      </div>
    </Card>
  );
}
