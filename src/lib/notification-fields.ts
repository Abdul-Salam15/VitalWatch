// ── Notification preference keys ────────────────────────────────────────────
// Shared between the settings UI and the updateNotification server action.
// Lives outside src/lib/actions/settings.ts because a "use server" file can
// only export async functions.
export const NOTIF_FIELDS = [
  'notifBrowser',
  'notifMedReminderEmail',
  'notifEmailSummary',
  'notifCaregiverMissedDose',
  'notifCaregiverAnomaly',
] as const;

export type NotifKey = (typeof NOTIF_FIELDS)[number];
