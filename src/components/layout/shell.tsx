'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { BottomTabs } from '@/components/layout/bottom-tabs';
import { MobileDrawer } from '@/components/layout/mobile-drawer';
import { AlarmManager } from '@/components/medication/alarm-manager';
import { updateTimezone } from '@/lib/actions/settings';
import type { ReminderWithWeek } from '@/lib/medication';

interface ShellProps {
  user: { name: string; email: string };
  reminders: ReminderWithWeek[];
  notifBrowser: boolean;
  timezone: string;
  notificationsSlot: React.ReactNode;
  children: React.ReactNode;
}

export function Shell({ user, reminders, notifBrowser, timezone, notificationsSlot, children }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);

  // Keep the stored timezone in sync with the browser's — used by reminder
  // emails and other server-side jobs to evaluate "due" times correctly.
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected && detected !== timezone) updateTimezone(detected);
    } catch {
      // Intl unavailable — keep the stored/default timezone
    }
  }, [timezone]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F8F7]">
      <AlarmManager reminders={reminders} notifBrowser={notifBrowser} />
      <Sidebar user={user} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} notificationsSlot={notificationsSlot} onMenu={() => setDrawer(true)} />
        <main className="flex-1 overflow-y-auto vw-scroll px-4 md:px-7 py-5 md:py-7 pb-24 md:pb-7">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <BottomTabs />
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}
