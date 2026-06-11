import { forwardRef } from 'react';
import { cx } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { TONES, overallStatus, type AnomalyStatus } from '@/lib/vitals';
import { fmtDateTime } from '@/lib/dates';
import type { LogResult } from '@/components/log-health/types';

const RESULT_BANNERS: Record<AnomalyStatus, { icon: string; label: string; sub: string }> = {
  green: { icon: 'check-circle', label: 'All Clear', sub: 'No anomalies detected in your readings.' },
  amber: { icon: 'alert-triangle', label: 'Monitor Closely', sub: 'Some readings warrant continued observation.' },
  red: { icon: 'alert-circle', label: 'Attention Needed', sub: 'Readings outside the normal range — review recommended.' },
};

export const AIResultCard = forwardRef<HTMLDivElement, { log: LogResult }>(function AIResultCard({ log }, ref) {
  const status = overallStatus(log);
  const b = RESULT_BANNERS[status];
  const bt = TONES[status];

  return (
    <div ref={ref}>
      <Card className="p-6 ring-1 ring-brand/15 vw-fade-up">
        <div className="flex items-center justify-between">
          <SectionTitle icon="sparkles" title="AI Analysis Result" />
          <Badge tone="green" className="bg-brand-light text-brand"><Icon name="zap" size={12} />Powered by Gemini</Badge>
        </div>

        <div className={cx('mt-4 flex items-center gap-3 rounded-xl border px-4 py-3', bt.bg, bt.border)}>
          <div className={cx('grid h-10 w-10 place-items-center rounded-lg bg-white', bt.text)}><Icon name={b.icon} size={20} /></div>
          <div><p className={cx('text-[15px] font-bold', bt.text)}>{b.label}</p><p className="text-xs text-slate-500">{b.sub}</p></div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2.5">Recommendations</p>
          <ul className="space-y-2.5">
            {log.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] leading-snug text-slate-600">
                <span className={cx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', status === 'green' ? 'bg-brand' : bt.dot)} />
                <span style={{ textWrap: 'pretty' }}>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
          <Icon name="clock" size={13} />Analyzed {fmtDateTime(log.ts)}
        </div>
      </Card>
    </div>
  );
});
