'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { Logo } from '@/components/layout/logo';
import { NAV } from '@/components/layout/nav';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 vw-fade" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl vw-fade p-4 flex flex-col" style={{ animation: 'vw-fade-up .25s' }}>
        <div className="flex items-center justify-between h-12 mb-2">
          <Logo />
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><Icon name="x" size={18} /></button>
        </div>
        <nav className="space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className={cx('flex items-center gap-3 w-full rounded-xl px-3.5 h-11 text-[15px] font-semibold', active ? 'bg-brand text-white' : 'text-slate-600 hover:bg-brand-tint')}
              >
                <Icon name={item.icon} size={20} />{item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
