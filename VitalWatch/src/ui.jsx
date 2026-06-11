// ── Reusable UI primitives ─────────────────────────────────────────────────
const cx = (...a) => a.filter(Boolean).join(' ');

// ---- Card -----------------------------------------------------------------
function Card({ className = '', children, tone = 'white', as: Tag = 'div', ...rest }) {
  const bg = tone === 'light' ? 'bg-brand-light' : tone === 'tint' ? 'bg-brand-tint' : 'bg-white';
  return (
    <Tag className={cx('rounded-2xl border border-slate-200/70 shadow-card', bg, className)} {...rest}>
      {children}
    </Tag>
  );
}

// ---- Button ---------------------------------------------------------------
function Button({ variant = 'primary', size = 'md', icon, iconRight, loading, className = '', children, ...rest }) {
  const sizes = {
    sm: 'h-9 px-3.5 text-sm gap-1.5',
    md: 'h-11 px-5 text-[15px] gap-2',
    lg: 'h-12 px-6 text-base gap-2',
    icon: 'h-9 w-9 justify-center',
  };
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark active:bg-brand-darker shadow-sm',
    outline: 'border border-brand/40 text-brand bg-white hover:bg-brand-tint',
    soft: 'bg-brand-light text-brand hover:bg-brand-200',
    ghost: 'text-slate-600 hover:bg-slate-100',
    'ghost-icon': 'text-slate-400 hover:text-slate-700 hover:bg-slate-100',
    destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
    'destructive-outline': 'border border-rose-300 text-rose-600 bg-white hover:bg-rose-50',
    white: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
  };
  return (
    <button
      className={cx('inline-flex items-center font-semibold rounded-xl transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed select-none', sizes[size], variants[variant], className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <Icon name="loader-2" size={16} className="vw-spin" /> : (icon && <Icon name={icon} size={size === 'lg' ? 18 : 16} />)}
      {children}
      {!loading && iconRight && <Icon name={iconRight} size={16} />}
    </button>
  );
}

// ---- Badge ----------------------------------------------------------------
function Badge({ tone = 'slate', icon, className = '', children, dot }) {
  const t = TONES[tone] || TONES.slate;
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', t.bg, t.text, className)}>
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', t.dot)} />}
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}

// ---- Toggle / Switch ------------------------------------------------------
function Toggle({ checked, onChange, size = 'md' }) {
  const dims = size === 'sm' ? { w: 'w-9', h: 'h-5', k: 'h-4 w-4', tr: 'translate-x-4' } : { w: 'w-11', h: 'h-6', k: 'h-5 w-5', tr: 'translate-x-5' };
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

// ---- Field / Input --------------------------------------------------------
function Field({ label, hint, error, children, htmlFor }) {
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

function Input({ unit, icon, error, className = '', leftIcon, ...rest }) {
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
        {...rest}
      />
      {unit && <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">{unit}</span>}
    </div>
  );
}

function Select({ className = '', children, ...rest }) {
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

// ---- Modal / Dialog -------------------------------------------------------
function Modal({ open, onClose, title, description, children, footer, size = 'md', icon }) {
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  const maxW = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }[size];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] vw-fade" onClick={onClose} />
      <div className={cx('relative w-full bg-white shadow-2xl vw-scale-in rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto vw-scroll', maxW)}>
        <div className="flex items-start gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
          {icon && <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-light text-brand"><Icon name={icon} size={20} /></div>}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Icon name="x" size={18} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}

// ---- Skeleton -------------------------------------------------------------
function Skeleton({ className = '' }) {
  return <div className={cx('animate-pulse rounded-lg bg-slate-200/70', className)} />;
}

// ---- Empty state ----------------------------------------------------------
function EmptyState({ icon = 'inbox', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-14">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-300 mb-4">
        <Icon name={icon} size={36} />
      </div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      {message && <p className="mt-1 max-w-xs text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ---- Section header -------------------------------------------------------
function SectionTitle({ icon, title, sub, action, className = '' }) {
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

// ---- Avatar ---------------------------------------------------------------
function Avatar({ name, size = 40, className = '' }) {
  return (
    <div className={cx('grid place-items-center rounded-full bg-brand text-white font-semibold', className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials(name)}
    </div>
  );
}

// ---- Toaster --------------------------------------------------------------
function Toaster() {
  const { toasts, dismissToast } = useStore();
  const map = {
    success: { icon: 'check-circle', cls: 'text-emerald-600' },
    error: { icon: 'x-circle', cls: 'text-rose-600' },
    info: { icon: 'info', cls: 'text-sky-600' },
    warning: { icon: 'alert-triangle', cls: 'text-amber-500' },
  };
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2.5 w-[min(92vw,360px)]">
      {toasts.map(t => {
        const m = map[t.tone] || map.success;
        return (
          <div key={t.id} className="vw-toast-in flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
            <Icon name={m.icon} size={18} className={cx('mt-0.5', m.cls)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{t.title}</p>
              {t.message && <p className="text-[13px] text-slate-500 mt-0.5">{t.message}</p>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="text-slate-300 hover:text-slate-500"><Icon name="x" size={15} /></button>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { cx, Card, Button, Badge, Toggle, Field, Input, Select, Modal, Skeleton, EmptyState, SectionTitle, Avatar, Toaster });
