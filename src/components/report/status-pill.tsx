import { cx } from '@/lib/utils';
import { TONES, type Tone } from '@/lib/vitals';

interface StatusPillProps {
  tone: Tone;
}

export function StatusPill({ tone }: StatusPillProps) {
  const t = TONES[tone] || TONES.slate;
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold', t.bg, t.text)}>
      <span className={cx('h-1.5 w-1.5 rounded-full', t.dot)} />
      {t.label}
    </span>
  );
}
