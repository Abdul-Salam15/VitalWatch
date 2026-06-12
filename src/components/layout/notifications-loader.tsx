import { getRecentLogs, getRemindersWithWeek } from '@/lib/data';
import { buildNotifications } from '@/lib/medication';
import { NotificationsBell } from '@/components/layout/notifications-bell';
import { zonedDate } from '@/lib/dates';

export async function NotificationsLoader({ userId, timezone }: { userId: string; timezone: string }) {
  const now = zonedDate(timezone);
  const [logs, reminders] = await Promise.all([
    getRecentLogs(userId, 6),
    getRemindersWithWeek(userId, now),
  ]);
  const notifications = buildNotifications(logs, reminders, now);
  return <NotificationsBell notifications={notifications} />;
}
