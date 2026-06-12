'use client';

import { useEffect } from 'react';
import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  dismissible?: boolean;
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md', icon, dismissible = true }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    if (!dismissible) return () => { document.body.style.overflow = ''; };
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => {
      window.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [open, onClose, dismissible]);

  if (!open) return null;
  const maxW = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] vw-fade" onClick={dismissible ? onClose : undefined} />
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
