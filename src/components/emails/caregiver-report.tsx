import { EmailLayout } from '@/components/emails/layout';

export interface CaregiverReportEmailProps {
  patientName: string;
  caregiverName: string;
  periodLabel: string;
}

export function CaregiverReportEmail({ patientName, caregiverName, periodLabel }: CaregiverReportEmailProps) {
  const first = (caregiverName || '').split(' ')[0];
  return (
    <EmailLayout
      previewText={`${patientName}'s health report — ${periodLabel}`}
      accent="brand"
      badge="Health report"
      badgeTone="green"
      heading={`${patientName}'s health report`}
      lead={`Hi ${first || 'there'}, attached is ${patientName}'s full health report (PDF) for ${periodLabel}. Download it to view vitals, medication adherence, and flagged anomalies.`}
      footnote={`You are receiving this because you are listed as ${patientName}'s caregiver on VitalWatch.`}
    />
  );
}

export default CaregiverReportEmail;
