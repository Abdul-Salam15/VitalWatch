'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Logo } from '@/components/layout/logo';
import { PAGE_TITLES } from '@/components/layout/nav';
import { relTime } from '@/lib/dates';
import { NOTIF_DOT, NOTIF_ICON, type NotificationItem } from '@/lib/medication';

interface HeaderProps {
  user: { name: string };
  notifications: NotificationItem[];
  onMenu: () => void;
}

export function Header({ user, notifications, onMenu }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [readCount, setReadCount] = useState(0);
  const unread = Math.max(0, notifications.length - readCount);

  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      if (next) setReadCount(notifications.length); // mark all as read on open
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-20 flex items-center h-16 gap-3 border-b border-slate-200 bg-white/90 backdrop-blur px-4 md:px-7">
      <button onClick={onMenu} className="md:hidden grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><Icon name="menu" size={20} /></button>
      <div className="md:hidden"><Logo /></div>

      <h1 className="hidden md:block text-[22px] font-bold tracking-tight text-slate-900">{PAGE_TITLES[pathname] || 'VitalWatch'}</h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button onClick={toggle} className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100">
            <Icon name="bell" size={20} />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-12 z-40 w-[min(88vw,340px)] rounded-2xl border border-slate-200 bg-white shadow-xl vw-scale-in overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Notifications</span>
                  <span className="text-xs font-medium text-slate-400">{notifications.length} recent</span>
                </div>
                <div className="max-h-80 overflow-y-auto vw-scroll divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-400">You&apos;re all caught up</div>
                  ) : notifications.map((n) => (
                    <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-slate-50">
                      <div className="relative shrink-0">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500"><Icon name={NOTIF_ICON[n.type]} size={16} /></div>
                        <span className={cx('absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white', NOTIF_DOT[n.type])} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800">{n.text}</p>
                        <p className="truncate text-xs text-slate-500">{n.detail}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-400 whitespace-nowrap">{relTime(n.ts)}</span>
                    </div>
                  ))}
                </div>
                <Link href="/reminders" onClick={() => setOpen(false)} className="block w-full px-4 py-2.5 text-center text-[13px] font-semibold text-brand hover:bg-brand-tint border-t border-slate-100">View all activity</Link>
              </div>
            </>
          )}
        </div>
        <Link href="/settings" className="rounded-full ring-2 ring-transparent hover:ring-brand-200 transition">
          <Avatar name={user.name} size={40} />
        </Link>
      </div>
    </header>
  );
}
