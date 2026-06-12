'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NOTIF_FIELDS, type NotifKey } from '@/lib/notification-fields';
import { sendCaregiverInviteEmail } from '@/lib/email/send';

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id;
}

export interface ActionResult {
  error?: string;
  success?: boolean;
}

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
});

export async function updateProfile(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = profileSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Invalid input' };

  await prisma.user.update({ where: { id: userId }, data: { name: parsed.data.name } });
  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { success: true };
}

const caregiverSchema = z.object({
  caregiverName: z.string().trim().max(100).default(''),
  caregiverEmail: z.union([z.string().trim().toLowerCase().email('Enter a valid email address'), z.literal('')]).default(''),
});

export async function updateCaregiver(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = caregiverSchema.safeParse({
    caregiverName: formData.get('caregiverName') ?? '',
    caregiverEmail: formData.get('caregiverEmail') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Invalid input' };

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, caregiverEmail: true, accessToken: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { caregiverName: parsed.data.caregiverName, caregiverEmail: parsed.data.caregiverEmail },
  });

  const newEmail = parsed.data.caregiverEmail;
  if (newEmail && newEmail !== existing?.caregiverEmail) {
    try {
      await sendCaregiverInviteEmail({
        to: newEmail,
        patientName: existing?.name || 'A VitalWatch patient',
        caregiverName: parsed.data.caregiverName || 'there',
        accessToken: existing?.accessToken || '',
      });
    } catch (err) {
      console.error('[settings] failed to send caregiver invite email:', err);
    }
  }

  revalidatePath('/settings');
  revalidatePath('/caregiver');
  return { success: true };
}

// IANA timezone strings only ever contain letters, digits, '/', '_', '+' and '-'
// (e.g. "Africa/Lagos", "America/New_York", "Etc/GMT+1").
const TZ_REGEX = /^[A-Za-z0-9_/+-]{1,64}$/;

export async function updateTimezone(timezone: string) {
  const userId = await requireUserId();
  if (!TZ_REGEX.test(timezone)) return;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
  } catch {
    return;
  }
  await prisma.user.update({ where: { id: userId }, data: { timezone } });
}

export async function updateNotification(key: NotifKey, value: boolean) {
  const userId = await requireUserId();
  if (!NOTIF_FIELDS.includes(key)) throw new Error('Invalid setting');

  await prisma.user.update({ where: { id: userId }, data: { [key]: value } });
  revalidatePath('/settings');
}

export async function regenerateAccessToken() {
  const userId = await requireUserId();
  const token = [16, 16, 16].map(() => Math.random().toString(16).slice(2, 6)).join('-');
  await prisma.user.update({ where: { id: userId }, data: { accessToken: token } });
  revalidatePath('/settings');
  revalidatePath('/caregiver');
  return token;
}

export async function deleteAccount() {
  const userId = await requireUserId();
  await prisma.user.delete({ where: { id: userId } });
}
