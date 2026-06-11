import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/data';
import { Shell } from '@/components/layout/shell';
import { NotificationsLoader } from '@/components/layout/notifications-loader';
import { NotificationsBellSkeleton } from '@/components/layout/notifications-bell';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <Shell
      user={{ name: user.name, email: user.email }}
      notificationsSlot={
        <Suspense fallback={<NotificationsBellSkeleton />}>
          <NotificationsLoader userId={user.id} />
        </Suspense>
      }
    >
      {children}
    </Shell>
  );
}
