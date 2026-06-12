'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NOTIF_FIELDS, type NotifKey } from '@/lib/notification-fields';

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

  await prisma.user.update({
    where: { id: userId },
    data: { caregiverName: parsed.data.caregiverName, caregiverEmail: parsed.data.caregiverEmail },
  });
  revalidatePath('/settings');
  revalidatePath('/caregiver');
  return { success: true };
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
