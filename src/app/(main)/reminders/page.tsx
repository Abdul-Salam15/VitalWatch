import { redirect } from 'next/navigation';
import { getCurrentUser, getRemindersWithWeek } from '@/lib/data';
import { RemindersPage } from '@/components/reminders/reminders-page';
import { zonedDate } from '@/lib/dates';

export default async function Reminders() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const now = zonedDate(user.timezone);
  const reminders = await getRemindersWithWeek(user.id, now);

  return (
    <RemindersPage
      reminders={reminders}
      now={now}
      user={{ name: user.name, email: user.email }}
      caregiverName={user.caregiverName}
      caregiverEmail={user.caregiverEmail}
    />
  );
}
