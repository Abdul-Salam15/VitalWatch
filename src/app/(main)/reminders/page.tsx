import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getRemindersWithWeek } from '@/lib/data';
import { RemindersPage } from '@/components/reminders/reminders-page';

export default async function Reminders() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
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
