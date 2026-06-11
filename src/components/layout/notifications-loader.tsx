import { getRecentLogs, getRemindersWithWeek } from '@/lib/data';
import { buildNotifications } from '@/lib/medication';
import { NotificationsBell } from '@/components/layout/notifications-bell';

export async function NotificationsLoader({ userId }: { userId: string }) {
  const [logs, reminders] = await Promise.all([
    getRecentLogs(userId, 6),
    getRemindersWithWeek(userId),
  ]);
  const notifications = buildNotifications(logs, reminders);
  return <NotificationsBell notifications={notifications} />;
}
