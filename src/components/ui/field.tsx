import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
  htmlFor?: string;
}

export function Field({ label, hint, error, children, htmlFor }: FieldProps) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700">{label}</label>}
      {children}
      {error
        ? <p className="flex items-center gap-1.5 text-[13px] font-medium text-rose-600"><Icon name="alert-circle" size={13} />{error}</p>
        : hint && <p className="text-[13px] text-emerald-600">{hint}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  unit?: string;
  leftIcon?: string;
  error?: boolean;
}

export function Input({ unit, error, className = '', leftIcon, onWheel, ...rest }: InputProps) {
  return (
    <div className="relative">
      {leftIcon && <Icon name={leftIcon} size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        className={cx(
          'w-full rounded-xl border bg-white px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 transition-shadow h-11',
          leftIcon && 'pl-10',
          unit && 'pr-16',
          error ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400' : 'border-slate-300 focus:ring-2 focus:ring-brand/25 focus:border-brand',
          className,
        )}
        onWheel={(e) => {
          // Prevent the browser's default behavior of nudging a focused
          // number input's value by `step` when the page is scrolled.
          if (e.currentTarget.type === 'number') e.currentTarget.blur();
          onWheel?.(e);
        }}
        {...rest}
      />
      {unit && <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">{unit}</span>}
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = '', children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cx('w-full appearance-none rounded-xl border border-slate-300 bg-white pl-3.5 pr-10 text-[15px] text-slate-900 h-11 transition-shadow focus:ring-2 focus:ring-brand/25 focus:border-brand', className)}
        {...rest}
      >
        {children}
      </select>
      <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
