import { EmailLayout } from '@/components/emails/layout';

export interface CaregiverInviteEmailProps {
  patientName: string;
  caregiverName: string;
  shareUrl: string;
}

export function CaregiverInviteEmail({ patientName, caregiverName, shareUrl }: CaregiverInviteEmailProps) {
  const first = (caregiverName || '').split(' ')[0];
  return (
    <EmailLayout
      previewText={`${patientName} added you as a caregiver on VitalWatch`}
      accent="brand"
      badge="Caregiver access"
      badgeTone="green"
      heading={`You're now ${patientName}'s caregiver`}
      lead={`Hi ${first || 'there'}, ${patientName} has added you as their caregiver on VitalWatch. You'll receive alerts for missed medication and abnormal vitals, and can view a read-only health overview at any time.`}
      cta={{ label: 'View health overview', url: shareUrl }}
      footnote={`You are receiving this because ${patientName} listed you as their caregiver on VitalWatch. If this wasn't expected, you can ignore this email.`}
    />
  );
}

export default CaregiverInviteEmail;
