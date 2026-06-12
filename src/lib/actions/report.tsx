'use server';

import { pdf } from '@react-pdf/renderer';
import { getCurrentUser, getLogsInRange, getRemindersWithWeek } from '@/lib/data';
import { rangeBounds, presetLabel, type ReportRange } from '@/components/report/report-metrics';
import { sendCaregiverReportEmail } from '@/lib/email/send';
import { PatientReportPdf } from '@/lib/pdf/patient-report-pdf';
import { zonedDate } from '@/lib/dates';

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
    getRemindersWithWeek(user.id, zonedDate(user.timezone)),
  ]);

  const periodLabel = presetLabel(range, bounds);

  const pdfStream = await pdf(
    <PatientReportPdf
      range={range}
      logs={logs}
      reminders={reminders}
      user={{ name: user.name, email: user.email }}
      caregiverName={user.caregiverName || ''}
    />
  ).toBuffer();

  const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    pdfStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
    pdfStream.on('error', reject);
  });

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const safeName = user.name.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'Patient';
  const pdfFilename = `${safeName} - ${dateStr}.pdf`;

  await sendCaregiverReportEmail({
    to: user.caregiverEmail,
    patientName: user.name,
    caregiverName: user.caregiverName || 'there',
    periodLabel,
    pdfBuffer,
    pdfFilename,
  });

  return { success: true };
}
