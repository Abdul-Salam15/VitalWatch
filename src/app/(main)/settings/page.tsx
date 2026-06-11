import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ProfileSection } from '@/components/settings/profile-section';
import { CaregiverSection } from '@/components/settings/caregiver-section';
import { NotificationsSection } from '@/components/settings/notifications-section';
import { DangerSection } from '@/components/settings/danger-section';

export default async function Settings() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect('/login');

  return (
    <div className="max-w-3xl space-y-5 md:space-y-6 vw-stagger">
      <ProfileSection user={{ name: user.name, email: user.email }} />
      <CaregiverSection caregiverName={user.caregiverName} caregiverEmail={user.caregiverEmail} />
      <NotificationsSection
        notif={{
          notifBrowser: user.notifBrowser,
          notifMedReminderEmail: user.notifMedReminderEmail,
          notifEmailSummary: user.notifEmailSummary,
          notifCaregiverMissedDose: user.notifCaregiverMissedDose,
          notifCaregiverAnomaly: user.notifCaregiverAnomaly,
        }}
      />
      <DangerSection />
    </div>
  );
}
