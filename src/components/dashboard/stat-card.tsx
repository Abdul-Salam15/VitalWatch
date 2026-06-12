import { cx } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { TONES, type Tone, hrStatus, spo2Status, tempStatus } from '@/lib/vitals';
import { TrendChip } from '@/components/dashboard/trend-chip';
import { dateKey } from '@/lib/dates';

interface StatCardProps {
  icon: string;
  iconFill?: boolean;
  label: string;
  value: React.ReactNode;
  unit?: string;
  tone: Tone;
  trend?: number;
  trendLabel?: string;
  readOnly?: boolean;
}

export function StatCard({ icon, iconFill, label, value, unit, tone, trend, trendLabel, readOnly }: StatCardProps) {
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
        {trend !== undefined ? (
          <>
            <TrendChip value={trend} />
            <span className="text-xs text-slate-400">{trendLabel}</span>
          </>
        ) : (
          <span className="text-xs text-slate-400">No earlier reading to compare</span>
        )}
      </div>
    </Card>
  );
}

export interface VitalLogLite {
  ts: Date | string;
  hr: number;
  spo2: number;
  temp: number;
  steps: number;
}

export function StatGrid({ logs, now, readOnly }: { logs: VitalLogLite[]; now: Date; readOnly?: boolean }) {
  const latest = logs[0] || ({} as Partial<VitalLogLite>);

  // Compare against the most recent reading from a different calendar day
  // (in the user's timezone) — logging multiple times today shouldn't show
  // a same-day delta as "vs. yesterday".
  const offsetMs = now.getTime() - Date.now();
  const zonedKey = (ts: Date | string) => dateKey(new Date(new Date(ts).getTime() + offsetMs));
  const latestKey = latest.ts ? zonedKey(latest.ts) : undefined;
  const prev = latestKey ? logs.slice(1).find((l) => zonedKey(l.ts) !== latestKey) : undefined;

  let trendLabel: string | undefined;
  if (prev && latestKey) {
    const days = Math.round((Date.parse(latestKey) - Date.parse(zonedKey(prev.ts))) / 86400000);
    trendLabel = days === 1 ? 'vs. yesterday' : days > 1 ? `vs. ${days} days ago` : 'vs. last reading';
  }

  const pct = (a?: number, b?: number) => (prev ? (b ? Math.round((((a ?? 0) - b) / b) * 100) : 0) : undefined);
  const cards: StatCardProps[] = [
    { icon: 'heart', iconFill: true, label: 'Heart Rate', value: latest.hr, unit: 'BPM', tone: hrStatus(latest.hr), trend: pct(latest.hr, prev?.hr), trendLabel },
    { icon: 'droplet', iconFill: true, label: 'SpO2', value: latest.spo2, unit: '%', tone: spo2Status(latest.spo2), trend: pct(latest.spo2, prev?.spo2), trendLabel },
    { icon: 'thermometer', label: 'Temperature', value: latest.temp, unit: '°C', tone: tempStatus(latest.temp), trend: pct(latest.temp, prev?.temp), trendLabel },
    { icon: 'footprints', label: 'Steps Today', value: (latest.steps || 0).toLocaleString(), unit: 'steps', tone: 'blue', trend: pct(latest.steps, prev?.steps), trendLabel },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 vw-stagger">
      {cards.map((c, i) => <StatCard key={i} {...c} readOnly={readOnly} />)}
    </div>
  );
}
