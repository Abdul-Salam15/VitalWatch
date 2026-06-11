import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getRecentLogs, getRemindersWithWeek } from '@/lib/data';
import { buildNotifications } from '@/lib/medication';
import { Shell } from '@/components/layout/shell';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect('/login');

  const [logs, reminders] = await Promise.all([
    getRecentLogs(user.id, 6),
    getRemindersWithWeek(user.id),
  ]);

  const notifications = buildNotifications(logs, reminders);

  return (
    <Shell user={{ name: user.name, email: user.email }} notifications={notifications} reminders={reminders} notifBrowser={user.notifBrowser}>
      {children}
    </Shell>
  );
}
