// ── Server-side data fetching helpers ──────────────────────────────────────
import { prisma } from '@/lib/db';
import { WEEK, weekdayDate, dateKey } from '@/lib/dates';
import type { ReminderWithWeek, DoseRecordLite } from '@/lib/medication';

export async function getRemindersWithWeek(userId: string, now: Date = new Date()): Promise<ReminderWithWeek[]> {
  const reminders = await prisma.reminder.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  if (reminders.length === 0) return [];

  const weekStart = weekdayDate(0, now);
  const weekEnd = weekdayDate(6, now);
  const doses = await prisma.doseRecord.findMany({
    where: {
      reminderId: { in: reminders.map((r) => r.id) },
      date: { gte: weekStart, lte: weekEnd },
    },
  });

  return reminders.map((r) => {
    const weekDoses: (DoseRecordLite | null)[] = WEEK.map((_, i) => {
      const day = weekdayDate(i, now);
      const dose = doses.find((d) => d.reminderId === r.id && dateKey(d.date) === dateKey(day));
      if (!dose) return null;
      return {
        date: dose.date,
        takenAt: dose.takenAt,
        reminderEmailSentAt: dose.reminderEmailSentAt,
        escalationEmailSentAt: dose.escalationEmailSentAt,
      };
    });
    return {
      id: r.id,
      name: r.name,
      dosage: r.dosage,
      time: r.time,
      frequency: r.frequency,
      customDays: r.customDays,
      escalation: r.escalation,
      active: r.active,
      createdAt: r.createdAt,
      weekDoses,
    };
  });
}

export async function getRecentLogs(userId: string, limit = 14) {
  return prisma.vitalLog.findMany({
    where: { userId },
    orderBy: { ts: 'desc' },
    take: limit,
  });
}

export async function getLogsInRange(userId: string, start?: Date, end?: Date) {
  return prisma.vitalLog.findMany({
    where: {
      userId,
      ts: { gte: start, lte: end },
    },
    orderBy: { ts: 'desc' },
  });
}
