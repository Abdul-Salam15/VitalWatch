import { notFound } from 'next/navigation';
import { getUserByAccessToken, getRecentLogs, getRemindersWithWeek } from '@/lib/data';
import { CaregiverPreview } from '@/components/caregiver/caregiver-preview';
import { zonedDate } from '@/lib/dates';

export default async function PublicCaregiverPage({ params }: { params: { token: string } }) {
  const user = await getUserByAccessToken(params.token);
  if (!user) notFound();

  const [logs, reminders] = await Promise.all([
    getRecentLogs(user.id, 14),
    getRemindersWithWeek(user.id, zonedDate(user.timezone)),
  ]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <CaregiverPreview
          logs={logs}
          reminders={reminders}
          user={{ name: user.name, email: user.email }}
          caregiverName={user.caregiverName}
          caregiverEmail={user.caregiverEmail}
        />
      </div>
    </div>
  );
}
