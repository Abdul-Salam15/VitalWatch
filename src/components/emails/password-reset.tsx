import { EmailLayout } from '@/components/emails/layout';

export interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export function PasswordResetEmail({ name, resetUrl }: PasswordResetEmailProps) {
  const first = (name || '').split(' ')[0];
  return (
    <EmailLayout
      previewText="Reset your VitalWatch password"
      accent="brand"
      heading={`Hi ${first}, reset your password`}
      lead="We received a request to reset the password for your VitalWatch account. Click the button below to choose a new password. This link expires in 1 hour."
      cta={{ label: 'Reset password', url: resetUrl }}
      footnote="If you didn't request a password reset, you can safely ignore this email — your password will not be changed."
    />
  );
}

export default PasswordResetEmail;
