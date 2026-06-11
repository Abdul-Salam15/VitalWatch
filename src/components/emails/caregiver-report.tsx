import { EmailLayout, type EmailRow } from '@/components/emails/layout';

export interface CaregiverReportEmailProps {
  patientName: string;
  caregiverName: string;
  periodLabel: string;
  rows: EmailRow[];
  appUrl: string;
}

export function CaregiverReportEmail({ patientName, caregiverName, periodLabel, rows, appUrl }: CaregiverReportEmailProps) {
  const first = (caregiverName || '').split(' ')[0];
  return (
    <EmailLayout
      previewText={`${patientName}'s health report — ${periodLabel}`}
      accent="brand"
      badge="Health report"
      badgeTone="green"
      heading={`${patientName}'s health summary`}
      lead={`Hi ${first || 'there'}, here is a summary of ${patientName}'s health and medication activity for ${periodLabel}.`}
      rows={rows}
      cta={{ label: 'View full report', url: `${appUrl}/caregiver` }}
      footnote={`You are receiving this because you are listed as ${patientName}'s caregiver on VitalWatch.`}
    />
  );
}

export default CaregiverReportEmail;
