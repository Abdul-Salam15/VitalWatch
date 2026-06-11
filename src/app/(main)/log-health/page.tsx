import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getRecentLogs } from '@/lib/data';
import { LogHealthPage } from '@/components/log-health/log-health-page';

export default async function LogHealth() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const logs = await getRecentLogs(session.user.id, 30);

  return <LogHealthPage logs={logs} />;
}
