'use server';

import { getCurrentUser, getLogsInRange, getRemindersWithWeek } from '@/lib/data';
import { weekAdherencePct, medicationAlerts } from '@/lib/medication';
import { rangeBounds, inRange, presetLabel, fmtNum, type ReportRange } from '@/components/report/report-metrics';
import { sendCaregiverReportEmail } from '@/lib/email/send';
import type { EmailRow } from '@/components/emails/layout';

export interface EmailReportResult {
  error?: string;
  success?: boolean;
}

export async function emailPatientReport(range: ReportRange): Promise<EmailReportResult> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not signed in.' };
  if (!user.caregiverEmail) return { error: 'Add a caregiver email in Settings before sending a report.' };

  const bounds = rangeBounds(range);

  const [logs, reminders] = await Promise.all([
    getLogsInRange(user.id, bounds.from ?? undefined, bounds.to ?? undefined),
    getRemindersWithWeek(user.id),
  ]);

  const periodLabel = presetLabel(range, bounds);
  const asc = [...logs].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  const avg = (key: 'hr' | 'spo2' | 'temp') => {
    const vals = asc.map((l) => +l[key]).filter((v) => !isNaN(v));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  const anomalies = logs.filter((l) => l.anomalyFlag);
  const adherencePct = weekAdherencePct(reminders);
  const missedCount = medicationAlerts(reminders).filter((m) => m.type === 'missed' && inRange(m.ts, bounds)).length;

  const rows: EmailRow[] = [
    { label: 'Period', value: periodLabel },
    { label: 'Readings logged', value: String(logs.length) },
    { label: 'Anomalies flagged', value: String(anomalies.length) },
    { label: 'Medication adherence', value: `${adherencePct}%` },
    { label: 'Missed doses', value: String(missedCount) },
    { label: 'Avg heart rate', value: `${fmtNum(avg('hr'), 0)} BPM` },
    { label: 'Avg SpO₂', value: `${fmtNum(avg('spo2'), 0)}%` },
    { label: 'Avg temperature', value: `${fmtNum(avg('temp'), 1)}°C` },
  ];

  await sendCaregiverReportEmail({
    to: user.caregiverEmail,
    patientName: user.name,
    caregiverName: user.caregiverName || 'there',
    periodLabel,
    rows,
  });

  return { success: true };
}
