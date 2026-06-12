// ── Brevo (Sendinblue) transactional email client ──────────────────────────
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'VitalWatch';
export const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'onboarding@vitalwatch.app';

export interface SendEmailAttachment {
  content: string;
  name: string;
}

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  attachment?: SendEmailAttachment[];
}

export async function sendEmail({ to, toName, subject, html, attachment }: SendEmailOptions): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn(`[email] BREVO_API_KEY not set — skipping email to ${to}: "${subject}"`);
    return;
  }

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: EMAIL_FROM_NAME, email: EMAIL_FROM_ADDRESS },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
      ...(attachment && attachment.length > 0 ? { attachment } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo email send failed (${res.status}): ${body}`);
  }
}
