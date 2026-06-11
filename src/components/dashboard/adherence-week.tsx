import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { WEEK } from '@/lib/dates';
import type { AdherenceState } from '@/lib/medication';

export const ADH: Record<AdherenceState, { cls: string; icon: string; label: string }> = {
  taken: { cls: 'bg-emerald-500 text-white', icon: 'check', label: 'Taken' },
  missed: { cls: 'bg-rose-500 text-white', icon: 'x', label: 'Missed' },
  pending: { cls: 'bg-amber-400 text-white', icon: 'clock', label: 'Pending' },
  none: { cls: 'bg-slate-100 text-slate-300', icon: 'minus', label: 'No dose' },
};

interface AdherenceWeekProps {
  states: AdherenceState[];
  withIcons?: boolean;
  size?: 'sm' | 'md';
}

export function AdherenceWeek({ states, withIcons = true, size = 'md' }: AdherenceWeekProps) {
  const h = size === 'sm' ? 'h-8' : 'h-11';
  return (
    <div className="grid grid-cols-7 gap-2">
      {WEEK.map((day, i) => {
        const a = ADH[states[i]] || ADH.none;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className={cx('w-full rounded-lg grid place-items-center font-bold', h, a.cls)}>
              {withIcons && <Icon name={a.icon} size={size === 'sm' ? 13 : 16} strokeWidth={2.5} />}
            </div>
            <span className="text-[11px] font-semibold text-slate-400">{day}</span>
          </div>
        );
      })}
    </div>
  );
}
