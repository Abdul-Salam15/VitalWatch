import { cx } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  tone?: 'white' | 'light' | 'tint';
  as?: keyof JSX.IntrinsicElements;
}

export function Card({ className = '', children, tone = 'white', as: Tag = 'div', ...rest }: CardProps) {
  const bg = tone === 'light' ? 'bg-brand-light' : tone === 'tint' ? 'bg-brand-tint' : 'bg-white';
  const Component = Tag as 'div';
  return (
    <Component className={cx('rounded-2xl border border-slate-200/70 shadow-card', bg, className)} {...rest}>
      {children}
    </Component>
  );
}
