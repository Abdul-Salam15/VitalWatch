import { redirect } from 'next/navigation';
import { getCurrentUser, getRecentLogs, getRemindersWithWeek } from '@/lib/data';
import { Icon } from '@/components/ui/icon';
import { AccessCard } from '@/components/caregiver/access-card';
import { CaregiverPreview } from '@/components/caregiver/caregiver-preview';

export default async function Caregiver() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [logs, reminders] = await Promise.all([
    getRecentLogs(user.id, 14),
    getRemindersWithWeek(user.id),
  ]);

  return (
    <div className="space-y-5 md:space-y-6">
      <AccessCard accessToken={user.accessToken} caregiverEmail={user.caregiverEmail} />
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icon name="eye" size={18} className="text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">Caregiver Dashboard Preview</h3>
          <span className="text-sm text-slate-400">— exactly what your caregiver sees</span>
        </div>
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
