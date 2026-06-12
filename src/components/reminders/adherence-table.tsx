import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { Icon } from '@/components/ui/icon';
import { cx } from '@/lib/utils';
import { WEEK } from '@/lib/dates';
import { weekAdherenceStates, type ReminderWithWeek } from '@/lib/medication';

interface AdherenceTableProps {
  reminders: ReminderWithWeek[];
  now: Date;
}

export function AdherenceTable({ reminders, now }: AdherenceTableProps) {
  if (!reminders.length) return null;
  return (
    <Card className="p-6 overflow-hidden">
      <SectionTitle icon="calendar" title="This Week's Adherence" sub="Per-medication breakdown" />
      <div className="mt-5 -mx-6 overflow-x-auto vw-scroll">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="text-left">
              <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Medication</th>
              {WEEK.map((d) => <th key={d} className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">{d}</th>)}
              <th className="px-6 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Rate</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((r) => {
              const states = weekAdherenceStates(r, now);
              const due = states.filter((s) => s === 'taken' || s === 'missed').length;
              const taken = states.filter((s) => s === 'taken').length;
              const rate = due ? Math.round((taken / due) * 100) : 0;
              return (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-6 py-3"><div className="flex items-center gap-2"><span className={cx('h-2 w-2 rounded-full', r.active ? 'bg-brand' : 'bg-slate-300')} /><span className="text-sm font-semibold text-slate-800">{r.name}</span></div></td>
                  {states.map((s, i) => (
                    <td key={i} className="px-2 py-3 text-center">
                      {s === 'taken' ? <Icon name="check" size={16} className="mx-auto text-emerald-500" strokeWidth={2.5} />
                        : s === 'missed' ? <Icon name="x" size={16} className="mx-auto text-rose-500" strokeWidth={2.5} />
                        : s === 'pending' ? <Icon name="clock" size={15} className="mx-auto text-amber-400" />
                        : <span className="text-slate-300">·</span>}
                    </td>
                  ))}
                  <td className="px-6 py-3 text-right"><span className={cx('text-sm font-bold tabular-nums', rate >= 80 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-rose-600')}>{rate}%</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
