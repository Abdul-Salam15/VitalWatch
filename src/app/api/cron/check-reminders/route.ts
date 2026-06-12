import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getRemindersWithWeek } from '@/lib/data';
import { doseState } from '@/lib/medication';
import { startOfDay, todayIdx } from '@/lib/dates';
import { sendMedicationReminderEmail, sendCaregiverAlertEmail } from '@/lib/email/send';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const now = new Date();
  const date = startOfDay(now);
  const ti = todayIdx(now);

  const users = await prisma.user.findMany({
    where: { reminders: { some: { active: true } } },
  });

  let remindersSent = 0;
  let escalationsSent = 0;

  for (const user of users) {
    const reminders = await getRemindersWithWeek(user.id, now);

    for (const r of reminders) {
      if (!r.active) continue;
      const st = doseState(r, now);
      const today = r.weekDoses[ti];

      // Send the patient reminder for both 'late' and 'escalated' — a dose can
      // jump straight to 'escalated' between cron ticks if the escalation
      // window is shorter than the polling interval.
      if ((st.status === 'late' || st.status === 'escalated') && user.notifMedReminderEmail && !today?.reminderEmailSentAt) {
        try {
          await sendMedicationReminderEmail({
            to: user.email,
            patientName: user.name,
            medName: r.name,
            dosage: r.dosage,
            time: r.time,
            escalation: r.escalation,
          });
          await prisma.doseRecord.upsert({
            where: { reminderId_date: { reminderId: r.id, date } },
            update: { reminderEmailSentAt: now },
            create: { reminderId: r.id, date, reminderEmailSentAt: now },
          });
          remindersSent++;
        } catch (err) {
          console.error(`[cron] failed to send reminder email for user ${user.id}, reminder ${r.id}:`, err);
        }
      }

      if (st.status === 'escalated' && user.notifCaregiverMissedDose && user.caregiverEmail && !today?.escalationEmailSentAt) {
        try {
          await sendCaregiverAlertEmail({
            to: user.caregiverEmail,
            patientName: user.name,
            caregiverName: user.caregiverName || 'a designated caregiver',
            medName: r.name,
            dosage: r.dosage,
            time: r.time,
            overdueMin: st.overdueMin || 0,
          });
          await prisma.doseRecord.upsert({
            where: { reminderId_date: { reminderId: r.id, date } },
            update: { escalationEmailSentAt: now },
            create: { reminderId: r.id, date, escalationEmailSentAt: now },
          });
          escalationsSent++;
        } catch (err) {
          console.error(`[cron] failed to send caregiver alert for user ${user.id}, reminder ${r.id}:`, err);
        }
      }
    }
  }

  return NextResponse.json({ ok: true, remindersSent, escalationsSent });
}
