import { EmailLayout } from '@/components/emails/layout';

export interface DailySummaryEmailProps {
  name: string;
  summary: string;
  recommendations: string[];
  hr: number;
  spo2: number;
  temp: number;
  steps: number;
  anomalyFlag: boolean;
  appUrl: string;
}

export function DailySummaryEmail({ name, summary, recommendations, hr, spo2, temp, steps, anomalyFlag, appUrl }: DailySummaryEmailProps) {
  const first = (name || '').split(' ')[0];
  return (
    <EmailLayout
      previewText="Your daily VitalWatch health summary"
      accent={anomalyFlag ? 'rose' : 'brand'}
      badge={anomalyFlag ? 'Needs attention' : 'All clear'}
      badgeTone={anomalyFlag ? 'amber' : 'green'}
      heading={`Good morning, ${first || 'there'}`}
      lead={summary}
      rows={[
        { label: 'Heart rate', value: `${hr} BPM` },
        { label: 'SpO₂', value: `${spo2}%` },
        { label: 'Temperature', value: `${temp}°C` },
        { label: 'Steps', value: steps.toLocaleString() },
      ]}
      list={recommendations}
      listTitle="Recommendations"
      cta={{ label: 'Open dashboard', url: `${appUrl}/dashboard` }}
      footnote="You're receiving this because daily AI summaries are enabled in VitalWatch settings."
    />
  );
}

export default DailySummaryEmail;
