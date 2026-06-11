import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

export type ButtonVariant =
  | 'primary'
  | 'outline'
  | 'soft'
  | 'ghost'
  | 'ghost-icon'
  | 'destructive'
  | 'destructive-outline'
  | 'white';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconRight?: string;
  loading?: boolean;
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-9 w-9 justify-center',
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark active:bg-brand-darker shadow-sm',
  outline: 'border border-brand/40 text-brand bg-white hover:bg-brand-tint',
  soft: 'bg-brand-light text-brand hover:bg-brand-200',
  ghost: 'text-slate-600 hover:bg-slate-100',
  'ghost-icon': 'text-slate-400 hover:text-slate-700 hover:bg-slate-100',
  destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
  'destructive-outline': 'border border-rose-300 text-rose-600 bg-white hover:bg-rose-50',
  white: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
};

export function Button({ variant = 'primary', size = 'md', icon, iconRight, loading, className = '', children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={cx('inline-flex items-center font-semibold rounded-xl transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed select-none', SIZES[size], VARIANTS[variant], className)}
      disabled={loading || disabled}
      {...rest}
    >
      {loading ? <Icon name="loader-2" size={16} className="vw-spin" /> : (icon && <Icon name={icon} size={size === 'lg' ? 18 : 16} />)}
      {children}
      {!loading && iconRight && <Icon name={iconRight} size={16} />}
    </button>
  );
}
