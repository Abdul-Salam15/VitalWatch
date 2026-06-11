'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  title: string;
  message?: string;
  tone?: ToastTone;
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (opts: ToastOptions | string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: ToastOptions | string) => {
    const id = 't' + Date.now() + Math.random().toString(16).slice(2, 6);
    const t = typeof opts === 'string' ? { title: opts } : opts;
    setToasts((ts) => [...ts, { id, tone: 'success' as ToastTone, ...t }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), t.duration || 3600);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toaster toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue['toast'] {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx.toast;
}

const TONE_MAP: Record<ToastTone, { icon: string; cls: string }> = {
  success: { icon: 'check-circle', cls: 'text-emerald-600' },
  error: { icon: 'x-circle', cls: 'text-rose-600' },
  info: { icon: 'info', cls: 'text-sky-600' },
  warning: { icon: 'alert-triangle', cls: 'text-amber-500' },
};

function Toaster({ toasts, dismissToast }: { toasts: Toast[]; dismissToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2.5 w-[min(92vw,360px)]">
      {toasts.map((t) => {
        const m = TONE_MAP[t.tone || 'success'];
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
