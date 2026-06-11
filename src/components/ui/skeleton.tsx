import { cx } from '@/lib/utils';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-lg bg-slate-200/70', className)} />;
}
