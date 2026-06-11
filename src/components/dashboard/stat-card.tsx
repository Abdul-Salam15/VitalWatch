import { cx } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { TONES, type Tone, hrStatus, spo2Status, tempStatus } from '@/lib/vitals';
import { TrendChip } from '@/components/dashboard/trend-chip';

interface StatCardProps {
  icon: string;
  iconFill?: boolean;
  label: string;
  value: React.ReactNode;
  unit?: string;
  tone: Tone;
  trend?: number;
  readOnly?: boolean;
}

export function StatCard({ icon, iconFill, label, value, unit, tone, trend, readOnly }: StatCardProps) {
  const t = TONES[tone] || TONES.slate;
  return (
    <Card tone="light" className={cx('p-5 relative', !readOnly && 'transition-shadow hover:shadow-md')}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <span className={cx('h-2 w-2 rounded-full', t.dot)} />
          <span className="text-[13px] font-semibold text-slate-500">{label}</span>
        </div>
        <div className={cx('grid h-9 w-9 place-items-center rounded-xl bg-white shadow-sm', t.icon)}>
          <Icon name={icon} size={18} fill={iconFill ? 'currentColor' : 'none'} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[34px] leading-none font-extrabold tracking-tight text-slate-900 tabular-nums">{value}</span>
        <span className="text-sm font-semibold text-slate-400">{unit}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {trend !== undefined && <TrendChip value={trend} />}
        <span className="text-xs text-slate-400">vs. yesterday</span>
      </div>
    </Card>
  );
}

export interface VitalLogLite {
  hr: number;
  spo2: number;
  temp: number;
  steps: number;
}

export function StatGrid({ logs, readOnly }: { logs: VitalLogLite[]; readOnly?: boolean }) {
  const latest = logs[0] || ({} as Partial<VitalLogLite>);
  const prev = logs[1] || latest;
  const pct = (a?: number, b?: number) => (b ? Math.round((((a ?? 0) - b) / b) * 100) : 0);
  const cards: StatCardProps[] = [
    { icon: 'heart', iconFill: true, label: 'Heart Rate', value: latest.hr, unit: 'BPM', tone: hrStatus(latest.hr), trend: pct(latest.hr, prev.hr) },
    { icon: 'droplet', iconFill: true, label: 'SpO2', value: latest.spo2, unit: '%', tone: spo2Status(latest.spo2), trend: pct(latest.spo2, prev.spo2) },
    { icon: 'thermometer', label: 'Temperature', value: latest.temp, unit: '°C', tone: tempStatus(latest.temp), trend: pct(latest.temp, prev.temp) },
    { icon: 'footprints', label: 'Steps Today', value: (latest.steps || 0).toLocaleString(), unit: 'steps', tone: 'blue', trend: pct(latest.steps, prev.steps) },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 vw-stagger">
      {cards.map((c, i) => <StatCard key={i} {...c} readOnly={readOnly} />)}
    </div>
  );
}
