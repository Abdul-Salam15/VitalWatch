'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Logo } from '@/components/layout/logo';
import { PAGE_TITLES } from '@/components/layout/nav';

interface HeaderProps {
  user: { name: string };
  notificationsSlot: React.ReactNode;
  onMenu: () => void;
}

export function Header({ user, notificationsSlot, onMenu }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 flex items-center h-16 gap-3 border-b border-slate-200 bg-white/90 backdrop-blur px-4 md:px-7">
      <button onClick={onMenu} className="md:hidden grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><Icon name="menu" size={20} /></button>
      <div className="md:hidden"><Logo /></div>

      <h1 className="hidden md:block text-[22px] font-bold tracking-tight text-slate-900">{PAGE_TITLES[pathname] || 'VitalWatch'}</h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {notificationsSlot}
        <Link href="/settings" className="rounded-full ring-2 ring-transparent hover:ring-brand-200 transition">
          <Avatar name={user.name} size={40} />
        </Link>
      </div>
    </header>
  );
}
