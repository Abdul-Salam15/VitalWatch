import { getResend, EMAIL_FROM } from '@/lib/email/resend';
import { MedicationReminderEmail } from '@/components/emails/medication-reminder';
import { CaregiverAlertEmail } from '@/components/emails/caregiver-alert';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendMedicationReminderEmail(opts: {
  to: string;
  patientName: string;
  medName: string;
  dosage: string;
  time: string;
  escalation: number;
}) {
  return getResend().emails.send({
    from: EMAIL_FROM,
    to: opts.to,
    subject: `⏰ Time for your ${opts.medName}`,
    react: MedicationReminderEmail({
      patientName: opts.patientName,
      medName: opts.medName,
      dosage: opts.dosage,
      time: opts.time,
      escalation: opts.escalation,
      appUrl: APP_URL,
    }),
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
  return getResend().emails.send({
    from: EMAIL_FROM,
    to: opts.to,
    subject: `⚠️ Missed medication alert — ${opts.patientName}`,
    react: CaregiverAlertEmail({
      patientName: opts.patientName,
      caregiverName: opts.caregiverName,
      medName: opts.medName,
      dosage: opts.dosage,
      time: opts.time,
      overdueMin: opts.overdueMin,
      appUrl: APP_URL,
    }),
  });
}
