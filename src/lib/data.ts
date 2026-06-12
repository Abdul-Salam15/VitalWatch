// ── Server-side data fetching helpers ──────────────────────────────────────
import { cache } from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { WEEK, weekdayDate, dateKey } from '@/lib/dates';
import type { ReminderWithWeek, DoseRecordLite } from '@/lib/medication';

// Memoized per-request: layout and the active page both need the signed-in
// user, so dedupe the session check + DB lookup into a single query.
export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
});

// Used by the public, unauthenticated caregiver share-link page.
export async function getUserByAccessToken(token: string) {
  return prisma.user.findUnique({ where: { accessToken: token } });
}

export const getRemindersWithWeek = cache(async (userId: string, now: Date = new Date()): Promise<ReminderWithWeek[]> => {
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
});

const RECENT_LOGS_MAX = 30;

// Always fetch the same window so layout + page calls within a request
// (different `limit`s) hit the same memoized query and just slice down.
const getRecentLogsRaw = cache((userId: string) =>
  prisma.vitalLog.findMany({
    where: { userId },
    orderBy: { ts: 'desc' },
    take: RECENT_LOGS_MAX,
  })
);

export async function getRecentLogs(userId: string, limit = 14) {
  const logs = await getRecentLogsRaw(userId);
  return logs.slice(0, limit);
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
