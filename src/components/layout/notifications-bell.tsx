'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { relTime } from '@/lib/dates';
import { NOTIF_DOT, NOTIF_ICON, type NotificationItem } from '@/lib/medication';

const READ_STORAGE_KEY = 'vw.readNotifications';

function loadRead(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

function saveRead(set: Set<string>) {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // localStorage unavailable — read state won't persist across reloads
  }
}

export function NotificationsBellSkeleton() {
  return (
    <div className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-300">
      <Icon name="bell" size={20} />
    </div>
  );
}

export function NotificationsBell({ notifications }: { notifications: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Load persisted read state, pruning ids that no longer appear in the feed.
  useEffect(() => {
    const stored = loadRead();
    const ids = new Set(notifications.map((n) => n.id));
    const pruned = new Set(Array.from(stored).filter((id) => ids.has(id)));
    setRead(pruned);
    if (pruned.size !== stored.size) saveRead(pruned);
  }, [notifications]);

  // Close on any click outside the bell/panel.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const unread = notifications.filter((n) => !read.has(n.id)).length;

  const markRead = (id: string) => {
    setRead((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveRead(next);
      return next;
    });
  };

  const markAllRead = () => {
    const next = new Set(notifications.map((n) => n.id));
    setRead(next);
    saveRead(next);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button onClick={() => setOpen((o) => !o)} className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100">
        <Icon name="bell" size={20} />
        {unread > 0 && <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-40 w-[min(88vw,340px)] rounded-2xl border border-slate-200 bg-white shadow-xl vw-scale-in overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-slate-800">Notifications</span>
            {unread > 0 ? (
              <button onClick={markAllRead} className="text-xs font-semibold text-brand hover:underline underline-offset-2">Mark all read</button>
            ) : (
              <span className="text-xs font-medium text-slate-400">{notifications.length} recent</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto vw-scroll divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">You&apos;re all caught up</div>
            ) : notifications.map((n) => {
              const isRead = read.has(n.id);
              return (
                <button key={n.id} onClick={() => markRead(n.id)} className={cx('flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50', !isRead && 'bg-brand-tint/40')}>
                  <div className="relative shrink-0">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500"><Icon name={NOTIF_ICON[n.type]} size={16} /></div>
                    {!isRead && <span className={cx('absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white', NOTIF_DOT[n.type])} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cx('text-sm', isRead ? 'font-medium text-slate-500' : 'font-semibold text-slate-800')}>{n.text}</p>
                    <p className="truncate text-xs text-slate-500">{n.detail}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-400 whitespace-nowrap">{relTime(n.ts)}</span>
                </button>
              );
            })}
          </div>
          <Link href="/reminders" onClick={() => setOpen(false)} className="block w-full px-4 py-2.5 text-center text-[13px] font-semibold text-brand hover:bg-brand-tint border-t border-slate-100">View all activity</Link>
        </div>
      )}
    </div>
  );
}
