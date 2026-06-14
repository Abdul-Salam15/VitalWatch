// ── Shared medication reminder email logic ─────────────────────────────────
// Used by both the scheduled cron job and the client-triggered check
// endpoint, since the GitHub Actions cron schedule can be delayed by hours
// under load and shouldn't be the only way these emails get sent.
import { prisma } from '@/lib/db';
import { getRemindersWithWeek } from '@/lib/data';
import { doseState } from '@/lib/medication';
import { startOfDay, todayIdx, zonedDate } from '@/lib/dates';
import { sendMedicationReminderEmail, sendCaregiverAlertEmail } from '@/lib/email/send';

export interface ReminderCheckUser {
  id: string;
  name: string;
  email: string;
  timezone: string;
  caregiverName: string;
  caregiverEmail: string;
  accessToken: string;
  notifMedReminderEmail: boolean;
  notifCaregiverMissedDose: boolean;
}

export interface ReminderCheckResult {
  remindersSent: number;
  escalationsSent: number;
}

// Evaluate one user's active reminders against the current time and send any
// due patient/caregiver emails that haven't been sent yet.
export async function checkUserReminders(user: ReminderCheckUser, realNow: Date = new Date()): Promise<ReminderCheckResult> {
  let remindersSent = 0;
  let escalationsSent = 0;

  // Evaluate "due" times in the user's own timezone, not the server's —
  // a reminder set for "09:11" means 09:11 local to the user.
  const now = zonedDate(user.timezone, realNow);
  const date = startOfDay(now);
  const ti = todayIdx(now);

  const reminders = await getRemindersWithWeek(user.id, now);

  for (const r of reminders) {
    if (!r.active) continue;
    const st = doseState(r, now);
    const today = r.weekDoses[ti];

    // Send the patient reminder for both 'late' and 'escalated' — a dose can
    // jump straight to 'escalated' between checks if the escalation window
    // is shorter than the polling interval.
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
          update: { reminderEmailSentAt: realNow },
          create: { reminderId: r.id, date, reminderEmailSentAt: realNow },
        });
        remindersSent++;
      } catch (err) {
        console.error(`[reminders] failed to send reminder email for user ${user.id}, reminder ${r.id}:`, err);
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
          accessToken: user.accessToken,
        });
        await prisma.doseRecord.upsert({
          where: { reminderId_date: { reminderId: r.id, date } },
          update: { escalationEmailSentAt: realNow },
          create: { reminderId: r.id, date, escalationEmailSentAt: realNow },
        });
        escalationsSent++;
      } catch (err) {
        console.error(`[reminders] failed to send caregiver alert for user ${user.id}, reminder ${r.id}:`, err);
      }
    }
  }

  return { remindersSent, escalationsSent };
}
