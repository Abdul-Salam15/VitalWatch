import { redirect } from 'next/navigation';
import { getCurrentUser, getRecentLogs, getRemindersWithWeek } from '@/lib/data';
import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { zonedDate } from '@/lib/dates';

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const now = zonedDate(user.timezone);
  const [logs, reminders] = await Promise.all([
    getRecentLogs(user.id, 14),
    getRemindersWithWeek(user.id, now),
  ]);

  return (
    <DashboardPage
      logs={logs}
      reminders={reminders}
      now={now}
      user={{ name: user.name, email: user.email }}
      caregiverName={user.caregiverName}
      caregiverEmail={user.caregiverEmail}
    />
  );
}
