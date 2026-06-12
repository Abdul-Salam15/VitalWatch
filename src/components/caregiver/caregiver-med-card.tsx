import { cx } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { TONES, type Tone } from '@/lib/vitals';
import { WEEK, fmtTime12 } from '@/lib/dates';
import { freqLabel, doseState, weekAdherenceStates, type ReminderWithWeek } from '@/lib/medication';
import { ADH } from '@/components/dashboard/adherence-week';

interface CaregiverMedCardProps {
  r: ReminderWithWeek;
  now: Date;
}

export function CaregiverMedCard({ r, now }: CaregiverMedCardProps) {
  const st = doseState(r, now);
  const states = weekAdherenceStates(r, now);
  const due = states.filter((s) => s === 'taken' || s === 'missed').length;
  const taken = states.filter((s) => s === 'taken').length;
  const rate = due ? Math.round((taken / due) * 100) : 0;

  const todayMeta: { tone: Tone; icon: string; label: string } = {
    taken: { tone: 'green' as Tone, icon: 'check-circle', label: 'Taken today' },
    upcoming: { tone: 'slate' as Tone, icon: 'clock', label: `Due ${fmtTime12(r.time)}` },
    late: { tone: 'amber' as Tone, icon: 'bell', label: 'Overdue today' },
    escalated: { tone: 'red' as Tone, icon: 'alert-triangle', label: 'Not taken on time' },
    none: { tone: 'slate' as Tone, icon: 'minus', label: 'Not scheduled today' },
  }[st.status];
  const tt = TONES[todayMeta.tone];

  return (
    <div className={cx('rounded-xl border p-4', !r.active && 'opacity-70', st.status === 'escalated' ? 'border-rose-200' : 'border-slate-200')}>
      <div className="flex items-start gap-3.5">
        <div className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-xl', r.active ? 'bg-brand-light text-brand' : 'bg-slate-100 text-slate-400')}>
          <Icon name="pill" size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-[16px] font-bold text-slate-900">{r.name}</h4>
            <Badge tone={r.active ? 'green' : 'slate'}>{freqLabel(r)}</Badge>
          </div>
          <p className="mt-0.5 text-[13px] text-slate-500">{r.dosage} · <Icon name="clock" size={12} className="inline -mt-0.5 text-slate-400" /> {fmtTime12(r.time)}</p>
        </div>
        <span className={cx('inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold', tt.bg, tt.text)}>
          <Icon name={todayMeta.icon} size={12} strokeWidth={2.5} />{todayMeta.label}
        </span>
      </div>

      <div className="mt-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">This week&apos;s intake</span>
          <span className={cx('text-[12px] font-bold tabular-nums', rate >= 80 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-rose-600')}>{rate}% taken</span>
        </div>
        <div className="flex gap-1.5">
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
    </div>
  );
}
