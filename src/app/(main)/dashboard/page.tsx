import { redirect } from 'next/navigation';
import { getCurrentUser, getRecentLogs, getRemindersWithWeek } from '@/lib/data';
import { DashboardPage } from '@/components/dashboard/dashboard-page';

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [logs, reminders] = await Promise.all([
    getRecentLogs(user.id, 14),
    getRemindersWithWeek(user.id),
  ]);

  return (
    <DashboardPage
      logs={logs}
      reminders={reminders}
      user={{ name: user.name, email: user.email }}
      caregiverName={user.caregiverName}
      caregiverEmail={user.caregiverEmail}
    />
  );
}
