'use client';

import { useState, useTransition } from 'react';
import { cx } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Toggle } from '@/components/ui/toggle';
import { WEEK, fmtTime12 } from '@/lib/dates';
import { freqLabel, weekAdherenceStates, type ReminderWithWeek } from '@/lib/medication';
import { ADH } from '@/components/dashboard/adherence-week';
import { toggleReminder, deleteReminder } from '@/lib/actions/reminders';
import { useToast } from '@/components/ui/toast';
import { ReminderDialog } from '@/components/reminders/reminder-dialog';

interface ReminderCardProps {
  r: ReminderWithWeek;
  now: Date;
}

export function ReminderCard({ r, now }: ReminderCardProps) {
  const toast = useToast();
  const [edit, setEdit] = useState(false);
  const [pending, startTransition] = useTransition();
  const states = weekAdherenceStates(r, now);

  const onToggle = () => startTransition(async () => {
    await toggleReminder(r.id);
  });

  const onDelete = () => startTransition(async () => {
    await deleteReminder(r.id);
    toast({ tone: 'info', title: `${r.name} reminder deleted` });
  });

  return (
    <>
      <Card className={cx('p-5 transition-shadow hover:shadow-md', !r.active && 'opacity-70')}>
        <div className="flex items-start gap-4">
          <div className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-xl', r.active ? 'bg-brand-light text-brand' : 'bg-slate-100 text-slate-400')}>
            <Icon name="pill" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-[18px] font-bold text-slate-900">{r.name}</h4>
              <Badge tone={r.active ? 'green' : 'slate'}>{freqLabel(r)}</Badge>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{r.dosage} · <Icon name="clock" size={13} className="inline -mt-0.5 text-slate-400" /> {fmtTime12(r.time)}</p>
          </div>
          <div className="flex items-center gap-1">
            <Toggle checked={r.active} onChange={onToggle} />
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-2"><span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">This week</span></div>
            <div className="flex gap-1 sm:gap-1.5">
              {WEEK.map((d, i) => {
                const a = ADH[states[i]] || ADH.none;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1" title={`${d}: ${a.label}`}>
                    <span className={cx('grid h-7 w-7 max-w-full place-items-center rounded-full', a.cls)}><Icon name={a.icon} size={12} strokeWidth={2.5} /></span>
                    <span className="text-[10px] font-medium text-slate-400">{d[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 pb-6">
            <button onClick={() => setEdit(true)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Icon name="pencil" size={16} /></button>
            <button onClick={onDelete} disabled={pending} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"><Icon name="trash-2" size={16} /></button>
          </div>
        </div>
      </Card>
      <ReminderDialog open={edit} onClose={() => setEdit(false)} editing={r} />
    </>
  );
}
