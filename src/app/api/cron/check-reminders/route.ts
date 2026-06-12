import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkUserReminders } from '@/lib/reminders/check';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const realNow = new Date();

  const users = await prisma.user.findMany({
    where: { reminders: { some: { active: true } } },
  });

  let remindersSent = 0;
  let escalationsSent = 0;

  for (const user of users) {
    const result = await checkUserReminders(user, realNow);
    remindersSent += result.remindersSent;
    escalationsSent += result.escalationsSent;
  }

  return NextResponse.json({ ok: true, remindersSent, escalationsSent });
}
