import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { Icon } from '@/components/ui/icon';
import { cx } from '@/lib/utils';
import { weekAdherencePct, type ReminderWithWeek, type AdherenceState } from '@/lib/medication';
import { ADH } from '@/components/dashboard/adherence-week';
import { CaregiverMedCard } from '@/components/caregiver/caregiver-med-card';

interface CaregiverMedsProps {
  reminders: ReminderWithWeek[];
}

const LEGEND: [AdherenceState, string][] = [
  ['taken', 'Taken'],
  ['missed', 'Missed'],
  ['pending', 'Pending'],
  ['none', 'No dose'],
];

export function CaregiverMeds({ reminders }: CaregiverMedsProps) {
  const active = reminders.filter((r) => r.active);
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionTitle icon="pill" title="Medications" sub={`${active.length} active · schedule, intake & status`} />
        <span className="text-sm font-semibold text-slate-500">Overall adherence <span className="text-brand font-extrabold">{weekAdherencePct(reminders)}%</span></span>
      </div>
      {reminders.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500"><Icon name="pill" size={16} className="text-slate-400" />No medications on file.</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
          {reminders.map((r) => <CaregiverMedCard key={r.id} r={r} />)}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
        {LEGEND.map(([k, l]) => (
          <span key={k} className="inline-flex items-center gap-1.5"><span className={cx('h-2.5 w-2.5 rounded-sm', ADH[k].cls.split(' ')[0])} />{l}</span>
        ))}
      </div>
    </Card>
  );
}
