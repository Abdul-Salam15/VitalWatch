import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

interface SectionTitleProps {
  icon?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SectionTitle({ icon, title, sub, action, className = '' }: SectionTitleProps) {
  return (
    <div className={cx('flex items-start justify-between gap-3', className)}>
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && <span className="text-brand"><Icon name={icon} size={20} /></span>}
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-900 leading-tight">{title}</h3>
          {sub && <p className="text-[13px] text-slate-500 mt-0.5">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
