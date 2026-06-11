'use client';

import { useState } from 'react';
import { cx } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SectionTitle } from '@/components/ui/section-title';
import { Skeleton } from '@/components/ui/skeleton';
import { TONES, overallStatus } from '@/lib/vitals';
import { relTime } from '@/lib/dates';

const BANNERS = {
  green: { tone: 'green' as const, icon: 'check-circle', label: 'All Clear', text: 'No anomalies detected in your latest readings.' },
  amber: { tone: 'amber' as const, icon: 'alert-triangle', label: 'Monitor Closely', text: 'Some readings warrant continued observation.' },
  red: { tone: 'red' as const, icon: 'alert-circle', label: 'Attention Needed', text: 'Readings outside normal range — review recommended.' },
};

export interface AISummaryLog {
  hr: number;
  spo2: number;
  temp: number;
  anomalyFlag: boolean;
  summary: string;
  ts: Date | string;
}

export function AISummaryCard({ latest }: { latest: AISummaryLog }) {
  const [analyzing, setAnalyzing] = useState(false);
  const status = overallStatus(latest);
  const banner = BANNERS[status];
  const bt = TONES[banner.tone];

  const reanalyze = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 1600);
  };

  return (
    <Card className="p-6 flex flex-col h-full">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle icon="sparkles" title="AI Analysis" />
        <Badge tone="green" className="bg-brand-light text-brand"><Icon name="zap" size={12} />Powered by VitalWatch AI</Badge>
      </div>

      <div className={cx('mt-4 flex items-center gap-3 rounded-xl border px-4 py-3', bt.bg, bt.border)}>
        <div className={cx('grid h-9 w-9 place-items-center rounded-lg bg-white', bt.text)}><Icon name={banner.icon} size={18} /></div>
        <div>
          <p className={cx('text-sm font-bold', bt.text)}>{banner.label}</p>
          <p className="text-xs text-slate-500">{banner.text}</p>
        </div>
      </div>

      <div className="mt-4 flex-1">
        {analyzing ? (
          <div className="space-y-2.5 pt-1">
            <Skeleton className="h-3.5 w-full" /><Skeleton className="h-3.5 w-[92%]" /><Skeleton className="h-3.5 w-[97%]" /><Skeleton className="h-3.5 w-3/4" />
            <p className="flex items-center gap-2 pt-2 text-sm font-medium text-brand"><Icon name="loader-2" size={15} className="vw-spin" />Analyzing with VitalWatch AI…</p>
          </div>
        ) : (
          <p className="text-[15px] leading-relaxed text-slate-600" style={{ textWrap: 'pretty' }}>{latest.summary}</p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-400">Last analysis {latest.ts ? relTime(latest.ts) : '—'}</span>
        <Button variant="outline" size="sm" icon="rotate-cw" loading={analyzing} onClick={reanalyze}>Re-analyze</Button>
      </div>
    </Card>
  );
}
