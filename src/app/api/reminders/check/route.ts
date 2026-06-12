import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkUserReminders } from '@/lib/reminders/check';

export const dynamic = 'force-dynamic';

// Client-triggered counterpart to the /api/cron/check-reminders job — called
// from the alarm manager while a user has the app open, so reminder /
// caregiver emails go out promptly even if the scheduled cron run is delayed.
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const result = await checkUserReminders(user, new Date());
  return NextResponse.json({ ok: true, ...result });
}
