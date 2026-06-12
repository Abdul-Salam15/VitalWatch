'use client';

import { useTransition } from 'react';
import { cx } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TONES } from '@/lib/vitals';
import { fmtTime12 } from '@/lib/dates';
import { doseState, type ReminderWithWeek } from '@/lib/medication';
import { checkInDose, undoDose } from '@/lib/actions/reminders';
import { useToast } from '@/components/ui/toast';
import { DOSE_META } from '@/components/medication/dose-meta';
import type { EmailPreviewDose } from '@/components/medication/email-preview-modal';

interface DoseRowProps {
  r: ReminderWithWeek;
  now: Date;
  onPreview: (kind: 'patient' | 'caregiver', dose: EmailPreviewDose) => void;
}

export function DoseRow({ r, now, onPreview }: DoseRowProps) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const st = doseState(r, now);
  const meta = DOSE_META[st.status];
  const t = TONES[meta.tone];

  const take = () => startTransition(async () => {
    await checkInDose(r.id);
    toast({ tone: 'success', title: `${r.name} marked as taken`, message: `Logged for ${fmtTime12(r.time)} today.` });
  });
  const undo = () => startTransition(async () => {
    await undoDose(r.id);
    toast({ tone: 'info', title: `${r.name} check-in undone` });
  });

  return (
    <div className={cx('flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3.5', st.status === 'taken' ? 'border-emerald-200 bg-emerald-50/50' : st.status === 'escalated' ? 'border-rose-200 bg-rose-50/40' : st.status === 'late' ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-white')}>
      <div className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-xl', t.soft, t.icon)}>
        <Icon name="pill" size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[15px] font-bold text-slate-900">{r.name}</p>
          <span className="whitespace-nowrap text-sm text-slate-500">{r.dosage}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-slate-500">
          <Icon name="clock" size={13} className="text-slate-400" />{fmtTime12(r.time)}
          <span className={cx('ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold', t.bg, t.text)}>
            <Icon name={meta.icon} size={11} strokeWidth={2.5} />{meta.label}
          </span>
        </div>
        {(st.status === 'late' || st.status === 'escalated') && (
          <button
            onClick={() => onPreview(st.status === 'escalated' ? 'caregiver' : 'patient', { name: r.name, dosage: r.dosage, time: r.time, escalation: r.escalation, overdueMin: st.overdueMin })}
            className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline underline-offset-2"
          >
            <Icon name={st.status === 'escalated' ? 'mail-check' : 'mail'} size={13} />
            {st.status === 'escalated' ? 'Caregiver emailed · view' : 'Reminder emailed to you · view'}
          </button>
        )}
      </div>
      <div className="shrink-0">
        {st.status === 'taken' ? (
          <Button variant="ghost" size="sm" icon="rotate-ccw" onClick={undo} loading={pending}>Undo</Button>
        ) : (
          <Button size="sm" icon="check" onClick={take} loading={pending}>Mark as taken</Button>
        )}
      </div>
    </div>
  );
}
