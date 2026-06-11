import { cx } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { AdherenceWeek, ADH } from '@/components/dashboard/adherence-week';
import { combinedWeek, weekAdherencePct, type ReminderWithWeek } from '@/lib/medication';

const LEGEND: [keyof typeof ADH, string][] = [
  ['taken', 'Taken'],
  ['missed', 'Missed'],
  ['pending', 'Pending'],
  ['none', 'No dose'],
];

export function AdherenceCard({ reminders }: { reminders: ReminderWithWeek[] }) {
  const pct = weekAdherencePct(reminders);
  const states = combinedWeek(reminders);
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <SectionTitle icon="pill" title="Medication Adherence" sub="This week" />
        <div className="text-right">
          <div className="text-2xl font-extrabold text-brand tabular-nums">{pct}%</div>
          <div className="text-xs font-semibold text-slate-400">adherence</div>
        </div>
      </div>
      <div className="mt-5"><AdherenceWeek states={states} /></div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
        {LEGEND.map(([k, l]) => (
          <span key={k} className="inline-flex items-center gap-1.5"><span className={cx('h-2.5 w-2.5 rounded-sm', ADH[k].cls.split(' ')[0])} />{l}</span>
        ))}
      </div>
    </Card>
  );
}
