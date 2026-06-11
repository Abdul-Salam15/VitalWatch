import { Resend } from 'resend';

let _resend: Resend | undefined;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || 're_disabled');
  }
  return _resend;
}

export const EMAIL_FROM = process.env.EMAIL_FROM || 'VitalWatch <onboarding@resend.dev>';
