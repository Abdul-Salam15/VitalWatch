import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { startOfDay, zonedDate } from '@/lib/dates';
import { buildRecommendations } from '@/lib/ai';
import { sendDailySummaryEmail } from '@/lib/email/send';

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

  const users = await prisma.user.findMany({ where: { notifEmailSummary: true } });

  let sent = 0;

  for (const user of users) {
    // "Today" means the user's local calendar day, not the server's.
    const since = startOfDay(zonedDate(user.timezone, realNow));
    const latest = await prisma.vitalLog.findFirst({
      where: { userId: user.id, ts: { gte: since } },
      orderBy: { ts: 'desc' },
    });
    if (!latest) continue;

    try {
      await sendDailySummaryEmail({
        to: user.email,
        name: user.name,
        summary: latest.summary,
        recommendations: buildRecommendations({
          hr: latest.hr,
          spo2: latest.spo2,
          temp: latest.temp,
          steps: latest.steps,
          anomalyFlag: latest.anomalyFlag,
        }),
        hr: latest.hr,
        spo2: latest.spo2,
        temp: latest.temp,
        steps: latest.steps,
        anomalyFlag: latest.anomalyFlag,
      });
      sent++;
    } catch (err) {
      console.error(`[cron] failed to send daily summary for user ${user.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
