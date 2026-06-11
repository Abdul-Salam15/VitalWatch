'use client';

import { useTransition } from 'react';
import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { TONES, hrStatus, spo2Status, tempStatus } from '@/lib/vitals';
import { fmtDateTime } from '@/lib/dates';
import { deleteVitalLog } from '@/lib/actions/vitals';
import { useToast } from '@/components/ui/toast';

interface LogEntryProps {
  log: {
    id: string;
    ts: Date | string;
    hr: number;
    spo2: number;
    temp: number;
    steps: number;
    summary: string;
    anomalyFlag: boolean;
  };
}

export function LogEntry({ log }: LogEntryProps) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const badges = [
    { v: log.hr, u: '', tone: hrStatus(log.hr), icon: 'heart' },
    { v: log.spo2, u: '%', tone: spo2Status(log.spo2), icon: 'droplet' },
    { v: log.temp, u: '°', tone: tempStatus(log.temp), icon: 'thermometer' },
    { v: (log.steps || 0).toLocaleString(), u: '', tone: 'blue' as const, icon: 'footprints' },
  ];

  const remove = () => startTransition(async () => {
    await deleteVitalLog(log.id);
    toast({ tone: 'info', title: 'Log entry deleted' });
  });

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-200 hover:shadow-sm transition">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{fmtDateTime(log.ts)}</span>
          {log.anomalyFlag && <Icon name="alert-triangle" size={15} className="text-amber-500" />}
        </div>
        <button onClick={remove} disabled={pending}
          className="opacity-0 group-hover:opacity-100 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-50">
          <Icon name="trash-2" size={15} />
        </button>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {badges.map((b, i) => {
          const t = TONES[b.tone];
          return (
            <span key={i} className={cx('inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold', t.bg, t.text)}>
              <Icon name={b.icon} size={12} />{b.v}{b.u}
            </span>
          );
        })}
      </div>
      <p className="mt-2.5 text-[13px] leading-snug text-slate-500">{log.summary.slice(0, 80)}{log.summary.length > 80 ? '…' : ''}</p>
    </div>
  );
}
