import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { TONES, type Tone } from '@/lib/vitals';

interface BadgeProps {
  tone?: Tone;
  icon?: string;
  className?: string;
  children?: React.ReactNode;
  dot?: boolean;
}

export function Badge({ tone = 'slate', icon, className = '', children, dot }: BadgeProps) {
  const t = TONES[tone] || TONES.slate;
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', t.bg, t.text, className)}>
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', t.dot)} />}
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}
