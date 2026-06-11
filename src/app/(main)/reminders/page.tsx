import { redirect } from 'next/navigation';
import { getCurrentUser, getRemindersWithWeek } from '@/lib/data';
import { RemindersPage } from '@/components/reminders/reminders-page';

export default async function Reminders() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const reminders = await getRemindersWithWeek(user.id);

  return (
    <RemindersPage
      reminders={reminders}
      user={{ name: user.name, email: user.email }}
      caregiverName={user.caregiverName}
      caregiverEmail={user.caregiverEmail}
    />
  );
}
