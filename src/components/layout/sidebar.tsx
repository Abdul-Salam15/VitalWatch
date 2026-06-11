'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cx } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Logo } from '@/components/layout/logo';
import { NAV } from '@/components/layout/nav';

interface SidebarProps {
  user: { name: string; email: string };
  collapsed: boolean;
  setCollapsed: (fn: (c: boolean) => boolean) => void;
}

export function Sidebar({ user, collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside
      className="hidden md:flex flex-col shrink-0 border-r border-slate-200 bg-white transition-[width] duration-200"
      style={{ width: collapsed ? 84 : 280 }}
    >
      <div className={cx('flex items-center h-16 px-5', collapsed && 'justify-center px-0')}>
        <Logo collapsed={collapsed} />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              title={collapsed ? item.label : undefined}
              className={cx(
                'group flex items-center w-full rounded-xl text-[15px] font-semibold transition-colors',
                collapsed ? 'justify-center h-11' : 'gap-3 px-3.5 h-11',
                active ? 'bg-brand text-white shadow-sm' : 'text-slate-600 hover:bg-brand-tint hover:text-brand',
              )}
            >
              <Icon name={item.icon} size={20} className={active ? '' : 'text-slate-400 group-hover:text-brand'} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100 space-y-1">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cx('flex items-center w-full rounded-xl h-10 text-sm font-medium text-slate-500 hover:bg-slate-100', collapsed ? 'justify-center' : 'gap-3 px-3.5')}
        >
          <Icon name={collapsed ? 'panel-left-open' : 'panel-left-close'} size={18} />
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cx('flex items-center w-full rounded-xl h-10 text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600', collapsed ? 'justify-center' : 'gap-3 px-3.5')}
          title={collapsed ? 'Sign out' : undefined}
        >
          <Icon name="log-out" size={18} />
          {!collapsed && <span>Sign out</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-3 rounded-xl px-2 py-2 mt-1">
            <Avatar name={user.name} size={36} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
