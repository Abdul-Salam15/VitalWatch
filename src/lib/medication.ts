// ── Medication scheduling, adherence & alert derivation ────────────────────
import { WEEK } from '@/lib/dates';
import { fmtTime12, fmtDuration, todayIdx, minsNow, reminderMins, todayTsAt, weekdayTs, weekdayDate, startOfDay } from '@/lib/dates';
import { tempStatus, hrStatus, spo2Status } from '@/lib/vitals';

export type AdherenceState = 'taken' | 'missed' | 'pending' | 'none';
export type TodayDoseStatus = 'taken' | 'upcoming' | 'late' | 'escalated' | 'none';

export interface DoseRecordLite {
  date: Date;
  takenAt: Date | null;
  reminderEmailSentAt: Date | null;
  escalationEmailSentAt: Date | null;
}

export interface ReminderLite {
  id: string;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  customDays: number[];
  escalation: number;
  active: boolean;
  createdAt: Date;
}

export interface ReminderWithWeek extends ReminderLite {
  // index 0=Mon … 6=Sun, for the current calendar week
  weekDoses: (DoseRecordLite | null)[];
}

export function freqLabel(r: { frequency: string; customDays: number[] }): string {
  if (r.frequency === 'Custom' && r.customDays?.length) {
    return r.customDays.map((i) => WEEK[i].slice(0, 3)).join('/');
  }
  return r.frequency;
}

export function isDueOnDay(r: { frequency: string; customDays: number[] }, dayIdx: number): boolean {
  if (r.frequency === 'Weekdays') return dayIdx <= 4;
  if (r.frequency === 'Weekends') return dayIdx >= 5;
  if (r.frequency === 'Custom') return !!r.customDays?.includes(dayIdx);
  return true; // Daily
}

export function isDueToday(r: ReminderLite, now: Date = new Date()): boolean {
  if (!r.active) return false;
  return isDueOnDay(r, todayIdx(now));
}

// 7-day adherence row (Mon..Sun) for a single reminder
export function weekAdherenceStates(r: ReminderWithWeek, now: Date = new Date()): AdherenceState[] {
  const ti = todayIdx(now);
  const createdDay = startOfDay(r.createdAt);
  return WEEK.map((_, i) => {
    const dose = r.weekDoses[i];
    if (dose?.takenAt) return 'taken';
    if (!r.active || !isDueOnDay(r, i)) return 'none';
    if (weekdayDate(i, now) < createdDay) return 'none';
    if (i < ti) return 'missed';
    if (i === ti) return 'pending';
    return 'none';
  });
}

// Collapse all reminders to a single 7-day status row for the dashboard
export function combinedWeek(reminders: ReminderWithWeek[], now: Date = new Date()): AdherenceState[] {
  return WEEK.map((_, i) => {
    const states = reminders.filter((r) => r.active).map((r) => weekAdherenceStates(r, now)[i]);
    if (states.length === 0 || states.every((s) => s === 'none')) return 'none';
    if (states.includes('missed')) return 'missed';
    if (states.includes('pending')) return 'pending';
    return 'taken';
  });
}

// week-wide adherence percentage across all active reminders
export function weekAdherencePct(reminders: ReminderWithWeek[], now: Date = new Date()): number {
  let taken = 0;
  let due = 0;
  reminders
    .filter((r) => r.active)
    .forEach((r) => {
      weekAdherenceStates(r, now).forEach((s) => {
        if (s === 'taken') {
          taken++;
          due++;
        } else if (s === 'missed') {
          due++;
        }
      });
    });
  return due === 0 ? 0 : Math.round((taken / due) * 100);
}

export interface DoseStateResult {
  status: TodayDoseStatus;
  late?: boolean;
  escalated?: boolean;
  scheduled?: number;
  overdueMin?: number;
}

// Runtime state of TODAY's dose for a reminder.
export function doseState(r: ReminderWithWeek, now: Date = new Date()): DoseStateResult {
  const ti = todayIdx(now);
  const today = r.weekDoses[ti];
  if (today?.takenAt) return { status: 'taken' };
  if (!isDueToday(r, now)) return { status: 'none' };
  const nowMin = minsNow(now);
  const sch = reminderMins(r.time);
  const grace = r.escalation || 30;
  if (nowMin >= sch + grace) return { status: 'escalated', late: true, escalated: true, scheduled: sch, overdueMin: nowMin - sch };
  if (nowMin >= sch) return { status: 'late', late: true, escalated: false, scheduled: sch, overdueMin: nowMin - sch };
  return { status: 'upcoming', scheduled: sch };
}

export interface MedAlert {
  id: string;
  reminderId: string;
  type: 'missed' | 'late';
  escalated: boolean;
  name: string;
  dosage: string;
  time: string;
  escalation: number;
  overdueMin?: number;
  reason: string;
  detail: string;
  ts: string;
}

// All medication "not on time" events: historical missed + today's late/escalated.
// escalated=true means the caregiver has been (or will be) emailed per the escalation delay.
export function medicationAlerts(reminders: ReminderWithWeek[], now: Date = new Date()): MedAlert[] {
  const out: MedAlert[] = [];
  const ti = todayIdx(now);
  reminders
    .filter((r) => r.active)
    .forEach((r) => {
      for (let i = 0; i < ti; i++) {
        const dose = r.weekDoses[i];
        if (!dose?.takenAt && isDueOnDay(r, i)) {
          out.push({
            id: `mm-${r.id}-${i}`,
            reminderId: r.id,
            type: 'missed',
            escalated: true,
            name: r.name,
            dosage: r.dosage,
            time: r.time,
            escalation: r.escalation,
            reason: `Missed dose — ${r.name} ${r.dosage}`,
            detail: `Scheduled ${fmtTime12(r.time)} · caregiver alerted`,
            ts: weekdayTs(i, now),
          });
        }
      }
      const st = doseState(r, now);
      if (st.status === 'escalated') {
        out.push({
          id: `me-${r.id}`,
          reminderId: r.id,
          type: 'late',
          escalated: true,
          name: r.name,
          dosage: r.dosage,
          time: r.time,
          escalation: r.escalation,
          overdueMin: st.overdueMin,
          reason: `Dose not taken on time — ${r.name} ${r.dosage}`,
          detail: `Scheduled ${fmtTime12(r.time)} · ${fmtDuration(st.overdueMin)} overdue`,
          ts: todayTsAt(st.scheduled!, now),
        });
      } else if (st.status === 'late') {
        out.push({
          id: `ml-${r.id}`,
          reminderId: r.id,
          type: 'late',
          escalated: false,
          name: r.name,
          dosage: r.dosage,
          time: r.time,
          escalation: r.escalation,
          overdueMin: st.overdueMin,
          reason: `Dose overdue — ${r.name} ${r.dosage}`,
          detail: `Scheduled ${fmtTime12(r.time)} · reminder sent to patient`,
          ts: todayTsAt(st.scheduled!, now),
        });
      }
    });
  return out;
}

export interface AnomalyAlert {
  id: string;
  ts: string;
  reason: string;
}

export function anomalyReason(l: { hr: number; spo2: number; temp: number }): string {
  if (tempStatus(l.temp) !== 'green') return `Elevated temperature (${l.temp}°C)`;
  if (hrStatus(l.hr) !== 'green') return `Irregular heart rate (${l.hr} BPM)`;
  if (spo2Status(l.spo2) !== 'green') return `Low oxygen saturation (${l.spo2}%)`;
  return 'Vitals flagged for review';
}

export function anomalyAlerts(logs: { id: string; ts: Date | string; anomalyFlag: boolean; hr: number; spo2: number; temp: number }[]): AnomalyAlert[] {
  return logs
    .filter((l) => l.anomalyFlag)
    .slice(0, 6)
    .map((l) => ({ id: l.id, ts: new Date(l.ts).toISOString(), reason: anomalyReason(l) }));
}

export interface CaregiverAlert {
  id: string;
  ts: string;
  reason: string;
  detail?: string;
  kind: 'vital' | 'med';
  emailed: boolean;
  name?: string;
  dosage?: string;
  time?: string;
  escalation?: number;
}

// Caregiver-facing alert feed: vital anomalies + escalated medication events.
export function caregiverAlerts(
  logs: { id: string; ts: Date | string; anomalyFlag: boolean; hr: number; spo2: number; temp: number }[],
  reminders: ReminderWithWeek[],
  now: Date = new Date(),
): CaregiverAlert[] {
  const vitals: CaregiverAlert[] = anomalyAlerts(logs).map((a) => ({ ...a, kind: 'vital', emailed: false }));
  const meds: CaregiverAlert[] = medicationAlerts(reminders, now)
    .filter((m) => m.escalated)
    .map((m) => ({
      id: m.id,
      ts: m.ts,
      reason: m.reason,
      detail: m.detail,
      kind: 'med',
      emailed: true,
      name: m.name,
      dosage: m.dosage,
      time: m.time,
      escalation: m.escalation,
    }));
  return [...vitals, ...meds].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()).slice(0, 8);
}

// Today's doses that require a patient reminder (overdue, not yet taken).
export function patientReminders(reminders: ReminderWithWeek[], now: Date = new Date()): { r: ReminderWithWeek; st: DoseStateResult }[] {
  return reminders
    .filter((r) => r.active)
    .map((r) => ({ r, st: doseState(r, now) }))
    .filter((x) => x.st.status === 'late' || x.st.status === 'escalated');
}

export type NotificationType = 'missed' | 'anomaly' | 'analysis' | 'reminder';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  text: string;
  detail: string;
  ts: string;
}

export const NOTIF_DOT: Record<NotificationType, string> = {
  missed: 'bg-rose-500',
  anomaly: 'bg-amber-500',
  analysis: 'bg-emerald-500',
  reminder: 'bg-amber-400',
};
export const NOTIF_ICON: Record<NotificationType, string> = {
  missed: 'pill',
  anomaly: 'alert-triangle',
  analysis: 'check-circle',
  reminder: 'bell',
};

// Build a unified notification feed: missed doses, anomalies, analysis-complete
export function buildNotifications(
  logs: { id: string; ts: Date | string; anomalyFlag: boolean; hr: number; spo2: number; temp: number }[],
  reminders: ReminderWithWeek[],
  now: Date = new Date(),
): NotificationItem[] {
  const items: NotificationItem[] = [];
  logs.slice(0, 6).forEach((l) => {
    const ts = new Date(l.ts).toISOString();
    if (l.anomalyFlag) items.push({ id: 'an-' + l.id, type: 'anomaly', text: 'Anomaly detected', detail: anomalyReason(l), ts });
    else items.push({ id: 'ok-' + l.id, type: 'analysis', text: 'Analysis complete', detail: 'Vitals reviewed — all clear', ts });
  });

  const ti = todayIdx(now);
  reminders
    .filter((r) => r.active)
    .forEach((r) => {
      for (let i = 0; i < ti; i++) {
        const dose = r.weekDoses[i];
        if (!dose?.takenAt && isDueOnDay(r, i)) {
          items.push({ id: `md-${r.id}-${i}`, type: 'missed', text: 'Missed dose', detail: `${r.name} ${r.dosage}`, ts: weekdayTs(i, now) });
        }
      }
    });

  patientReminders(reminders, now).forEach(({ r, st }) => {
    items.push({
      id: `rem-today-${r.id}`,
      type: st.escalated ? 'missed' : 'reminder',
      text: st.escalated ? 'Dose overdue — caregiver alerted' : 'Time for your medication',
      detail: `${r.name} ${r.dosage} · ${fmtTime12(r.time)}`,
      ts: todayTsAt(st.scheduled!, now),
    });
  });

  return items.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()).slice(0, 6);
}
