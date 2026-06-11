import { EmailLayout } from '@/components/emails/layout';
import { fmtTime12 } from '@/lib/dates';

export interface MedicationReminderEmailProps {
  patientName: string;
  medName: string;
  dosage: string;
  time: string;
  escalation: number;
  appUrl: string;
}

export function MedicationReminderEmail({ patientName, medName, dosage, time, escalation, appUrl }: MedicationReminderEmailProps) {
  const first = (patientName || '').split(' ')[0];
  return (
    <EmailLayout
      previewText={`Time for your ${medName}`}
      accent="brand"
      badge="Medication reminder"
      badgeTone="amber"
      heading={`Hi ${first}, it's time for your ${medName}`}
      lead={`This is your reminder to take ${medName} (${dosage}), scheduled for ${fmtTime12(time)}. Open VitalWatch and check in once you've taken it.`}
      rows={[
        { label: 'Medication', value: `${medName} ${dosage}` },
        { label: 'Scheduled for', value: fmtTime12(time) },
      ]}
      cta={{ label: 'Check in — mark as taken', url: `${appUrl}/reminders` }}
      footnote={`If you've already taken this dose, you can ignore this email. If you miss it by more than ${escalation || 30} minutes, your caregiver will be notified automatically.`}
    />
  );
}

export default MedicationReminderEmail;
