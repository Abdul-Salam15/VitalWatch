import { render } from '@react-email/render';
import { sendEmail } from '@/lib/email/brevo';
import { MedicationReminderEmail } from '@/components/emails/medication-reminder';
import { CaregiverAlertEmail } from '@/components/emails/caregiver-alert';
import { CaregiverVitalAlertEmail } from '@/components/emails/caregiver-vital-alert';
import { CaregiverInviteEmail } from '@/components/emails/caregiver-invite';
import { DailySummaryEmail } from '@/components/emails/daily-summary';
import { PasswordResetEmail } from '@/components/emails/password-reset';
import { CaregiverReportEmail } from '@/components/emails/caregiver-report';

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
  accessToken: string;
}) {
  const html = await render(CaregiverAlertEmail({
    patientName: opts.patientName,
    caregiverName: opts.caregiverName,
    medName: opts.medName,
    dosage: opts.dosage,
    time: opts.time,
    overdueMin: opts.overdueMin,
    shareUrl: `${APP_URL}/caregiver/${opts.accessToken}`,
  }));

  return sendEmail({
    to: opts.to,
    toName: opts.caregiverName,
    subject: `⚠️ Missed medication alert — ${opts.patientName}`,
    html,
  });
}

export async function sendCaregiverInviteEmail(opts: {
  to: string;
  patientName: string;
  caregiverName: string;
  accessToken: string;
}) {
  const shareUrl = `${APP_URL}/caregiver/${opts.accessToken}`;
  const html = await render(CaregiverInviteEmail({
    patientName: opts.patientName,
    caregiverName: opts.caregiverName,
    shareUrl,
  }));

  return sendEmail({
    to: opts.to,
    toName: opts.caregiverName,
    subject: `You've been added as ${opts.patientName}'s caregiver on VitalWatch`,
    html,
  });
}

export async function sendCaregiverVitalAlertEmail(opts: {
  to: string;
  patientName: string;
  caregiverName: string;
  reason: string;
  hr: number;
  spo2: number;
  temp: number;
  ts: Date;
  accessToken: string;
}) {
  const html = await render(CaregiverVitalAlertEmail({
    patientName: opts.patientName,
    caregiverName: opts.caregiverName,
    reason: opts.reason,
    hr: opts.hr,
    spo2: opts.spo2,
    temp: opts.temp,
    ts: opts.ts,
    shareUrl: `${APP_URL}/caregiver/${opts.accessToken}`,
  }));

  return sendEmail({
    to: opts.to,
    toName: opts.caregiverName,
    subject: `⚠️ Vital sign alert — ${opts.patientName}`,
    html,
  });
}

export async function sendDailySummaryEmail(opts: {
  to: string;
  name: string;
  summary: string;
  recommendations: string[];
  hr: number;
  spo2: number;
  temp: number;
  steps: number;
  anomalyFlag: boolean;
}) {
  const html = await render(DailySummaryEmail({
    name: opts.name,
    summary: opts.summary,
    recommendations: opts.recommendations,
    hr: opts.hr,
    spo2: opts.spo2,
    temp: opts.temp,
    steps: opts.steps,
    anomalyFlag: opts.anomalyFlag,
    appUrl: APP_URL,
  }));

  return sendEmail({
    to: opts.to,
    toName: opts.name,
    subject: 'Your daily VitalWatch health summary',
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
  pdfBuffer: Buffer;
  pdfFilename: string;
}) {
  const html = await render(CaregiverReportEmail({
    patientName: opts.patientName,
    caregiverName: opts.caregiverName,
    periodLabel: opts.periodLabel,
  }));

  return sendEmail({
    to: opts.to,
    toName: opts.caregiverName,
    subject: `${opts.patientName}'s health report — ${opts.periodLabel}`,
    html,
    attachment: [{ content: opts.pdfBuffer.toString('base64'), name: opts.pdfFilename }],
  });
}
