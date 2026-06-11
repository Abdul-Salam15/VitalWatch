'use client';

import { cx } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, size = 'md' }: ToggleProps) {
  const dims = size === 'sm'
    ? { w: 'w-9', h: 'h-5', k: 'h-4 w-4', tr: 'translate-x-4' }
    : { w: 'w-11', h: 'h-6', k: 'h-5 w-5', tr: 'translate-x-5' };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx('relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200', dims.w, dims.h, checked ? 'bg-brand' : 'bg-slate-300')}
    >
      <span className={cx('inline-block transform rounded-full bg-white shadow transition-transform duration-200 ml-0.5', dims.k, checked ? dims.tr : 'translate-x-0')} />
    </button>
  );
}
