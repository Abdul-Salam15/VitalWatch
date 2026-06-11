import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

export function TrendChip({ value }: { value: number }) {
  const dir = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const map = {
    up: { icon: 'trending-up', cls: 'text-emerald-600 bg-emerald-50' },
    down: { icon: 'trending-down', cls: 'text-rose-600 bg-rose-50' },
    flat: { icon: 'minus', cls: 'text-slate-500 bg-slate-100' },
  }[dir];
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold', map.cls)}>
      <Icon name={map.icon} size={12} strokeWidth={2.5} />{value > 0 ? '+' : ''}{value}%
    </span>
  );
}
