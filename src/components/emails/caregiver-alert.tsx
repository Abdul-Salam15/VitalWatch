import { EmailLayout } from '@/components/emails/layout';
import { fmtTime12, fmtDuration } from '@/lib/dates';

export interface CaregiverAlertEmailProps {
  patientName: string;
  caregiverName: string;
  medName: string;
  dosage: string;
  time: string;
  overdueMin: number;
  shareUrl: string;
}

export function CaregiverAlertEmail({ patientName, caregiverName, medName, dosage, time, overdueMin, shareUrl }: CaregiverAlertEmailProps) {
  return (
    <EmailLayout
      previewText={`Missed medication alert — ${patientName}`}
      accent="rose"
      badge="Escalation alert"
      badgeTone="red"
      heading={`${patientName} has not taken a scheduled dose`}
      lead={`A medication dose was not logged within the escalation window. As ${caregiverName}, you're being notified so you can follow up.`}
      rows={[
        { label: 'Medication', value: `${medName} ${dosage}` },
        { label: 'Scheduled for', value: fmtTime12(time) },
        { label: 'Status', value: `Overdue by ${fmtDuration(overdueMin)}` },
        { label: 'Patient', value: patientName },
      ]}
      cta={{ label: 'Open caregiver dashboard', url: shareUrl }}
      footnote={`You are receiving this because missed-dose alerts are enabled for ${patientName}. Manage alert preferences in VitalWatch settings.`}
    />
  );
}

export default CaregiverAlertEmail;
