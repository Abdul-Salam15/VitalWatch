import { render } from '@react-email/render';
import { sendEmail } from '@/lib/email/brevo';
import { MedicationReminderEmail } from '@/components/emails/medication-reminder';
import { CaregiverAlertEmail } from '@/components/emails/caregiver-alert';
import { PasswordResetEmail } from '@/components/emails/password-reset';
import { CaregiverReportEmail } from '@/components/emails/caregiver-report';
import type { EmailRow } from '@/components/emails/layout';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendMedicationReminderEmail(opts: {
  to: string;
  patientName: string;
  medName: string;
  dosage: string;
  time: string;
  escalation: number;
}) {
  const html = await render(MedicationReminderEmail({
    patientName: opts.patientName,
    medName: opts.medName,
    dosage: opts.dosage,
    time: opts.time,
    escalation: opts.escalation,
    appUrl: APP_URL,
  }));

  return sendEmail({
    to: opts.to,
    toName: opts.patientName,
    subject: `⏰ Time for your ${opts.medName}`,
    html,
  });
}

export async function sendCaregiverAlertEmail(opts: {
  to: string;
  patientName: string;
  caregiverName: string;
  medName: string;
  dosage: string;
  time: string;
  overdueMin: number;
}) {
  const html = await render(CaregiverAlertEmail({
    patientName: opts.patientName,
    caregiverName: opts.caregiverName,
    medName: opts.medName,
    dosage: opts.dosage,
    time: opts.time,
    overdueMin: opts.overdueMin,
    appUrl: APP_URL,
  }));

  return sendEmail({
    to: opts.to,
    toName: opts.caregiverName,
    subject: `⚠️ Missed medication alert — ${opts.patientName}`,
    html,
  });
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  token: string;
}) {
  const resetUrl = `${APP_URL}/reset-password?token=${opts.token}`;
  const html = await render(PasswordResetEmail({
    name: opts.name,
    resetUrl,
  }));

  return sendEmail({
    to: opts.to,
    toName: opts.name,
    subject: 'Reset your VitalWatch password',
    html,
  });
}

export async function sendCaregiverReportEmail(opts: {
  to: string;
  patientName: string;
  caregiverName: string;
  periodLabel: string;
  rows: EmailRow[];
}) {
  const html = await render(CaregiverReportEmail({
    patientName: opts.patientName,
    caregiverName: opts.caregiverName,
    periodLabel: opts.periodLabel,
    rows: opts.rows,
    appUrl: APP_URL,
  }));

  return sendEmail({
    to: opts.to,
    toName: opts.caregiverName,
    subject: `${opts.patientName}'s health report — ${opts.periodLabel}`,
    html,
  });
}
