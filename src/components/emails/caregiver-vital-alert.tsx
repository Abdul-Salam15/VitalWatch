import { EmailLayout } from '@/components/emails/layout';
import { fmtDateTime } from '@/lib/dates';

export interface CaregiverVitalAlertEmailProps {
  patientName: string;
  caregiverName: string;
  reason: string;
  hr: number;
  spo2: number;
  temp: number;
  ts: Date | string;
  shareUrl: string;
}

export function CaregiverVitalAlertEmail({ patientName, caregiverName, reason, hr, spo2, temp, ts, shareUrl }: CaregiverVitalAlertEmailProps) {
  return (
    <EmailLayout
      previewText={`Vital sign alert — ${patientName}`}
      accent="rose"
      badge="Anomaly detected"
      badgeTone="red"
      heading={`${patientName}'s vitals need attention`}
      lead={`${reason}. As ${caregiverName}, you're being notified so you can follow up with ${patientName}.`}
      rows={[
        { label: 'Heart rate', value: `${hr} BPM` },
        { label: 'SpO₂', value: `${spo2}%` },
        { label: 'Temperature', value: `${temp}°C` },
        { label: 'Recorded', value: fmtDateTime(ts) },
      ]}
      cta={{ label: 'Open caregiver dashboard', url: shareUrl }}
      footnote={`You are receiving this because anomaly alerts are enabled for ${patientName}. Manage alert preferences in VitalWatch settings.`}
    />
  );
}

export default CaregiverVitalAlertEmail;
