import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser, getRemindersWithWeek } from '@/lib/data';
import { Shell } from '@/components/layout/shell';
import { NotificationsLoader } from '@/components/layout/notifications-loader';
import { NotificationsBellSkeleton } from '@/components/layout/notifications-bell';
import { zonedDate } from '@/lib/dates';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const reminders = await getRemindersWithWeek(user.id, zonedDate(user.timezone));

  return (
    <Shell
      user={{ name: user.name, email: user.email }}
      reminders={reminders}
      notifBrowser={user.notifBrowser}
      timezone={user.timezone}
      notificationsSlot={
        <Suspense fallback={<NotificationsBellSkeleton />}>
          <NotificationsLoader userId={user.id} timezone={user.timezone} />
        </Suspense>
      }
    >
      {children}
    </Shell>
  );
}
