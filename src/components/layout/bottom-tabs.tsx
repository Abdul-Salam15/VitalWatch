'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { NAV } from '@/components/layout/nav';

export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {NAV.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cx('flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold', active ? 'text-brand' : 'text-slate-400')}
            >
              <div className={cx('grid h-8 w-12 place-items-center rounded-full transition-colors', active && 'bg-brand-light')}>
                <Icon name={item.icon} size={20} />
              </div>
              {item.label.split(' ')[0]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
