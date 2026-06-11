'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { startOfDay } from '@/lib/dates';

const reminderSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  dosage: z.string().trim().min(1, 'Dosage is required').max(50),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Enter a valid time'),
  frequency: z.enum(['Daily', 'Weekdays', 'Weekends', 'Custom']),
  customDays: z.array(z.coerce.number().int().min(0).max(6)).default([]),
  escalation: z.coerce.number().int().min(5).max(240),
});

function parseReminderForm(formData: FormData) {
  const customDays = formData.getAll('customDays').map((d) => Number(d));
  return reminderSchema.safeParse({
    name: formData.get('name'),
    dosage: formData.get('dosage'),
    time: formData.get('time'),
    frequency: formData.get('frequency'),
    customDays,
    escalation: formData.get('escalation'),
  });
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id;
}

function revalidateAll() {
  revalidatePath('/dashboard');
  revalidatePath('/reminders');
  revalidatePath('/caregiver');
}

export interface ReminderFormResult {
  error?: string;
  success?: boolean;
}

export async function createReminder(_prev: ReminderFormResult | undefined, formData: FormData): Promise<ReminderFormResult> {
  const userId = await requireUserId();
  const parsed = parseReminderForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Invalid input' };

  await prisma.reminder.create({
    data: {
      userId,
      name: parsed.data.name,
      dosage: parsed.data.dosage,
      time: parsed.data.time,
      frequency: parsed.data.frequency,
      customDays: parsed.data.frequency === 'Custom' ? parsed.data.customDays : [],
      escalation: parsed.data.escalation,
    },
  });

  revalidateAll();
  return { success: true };
}

export async function updateReminder(id: string, _prev: ReminderFormResult | undefined, formData: FormData): Promise<ReminderFormResult> {
  const userId = await requireUserId();
  const parsed = parseReminderForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Invalid input' };

  const result = await prisma.reminder.updateMany({
    where: { id, userId },
    data: {
      name: parsed.data.name,
      dosage: parsed.data.dosage,
      time: parsed.data.time,
      frequency: parsed.data.frequency,
      customDays: parsed.data.frequency === 'Custom' ? parsed.data.customDays : [],
      escalation: parsed.data.escalation,
    },
  });
  if (result.count === 0) return { error: 'Reminder not found' };

  revalidateAll();
  return { success: true };
}

export async function deleteReminder(id: string) {
  const userId = await requireUserId();
  await prisma.reminder.deleteMany({ where: { id, userId } });
  revalidateAll();
}

export async function toggleReminder(id: string) {
  const userId = await requireUserId();
  const reminder = await prisma.reminder.findFirst({ where: { id, userId } });
  if (!reminder) throw new Error('Not found');
  await prisma.reminder.update({ where: { id }, data: { active: !reminder.active } });
  revalidateAll();
}

export async function checkInDose(reminderId: string) {
  const userId = await requireUserId();
  const reminder = await prisma.reminder.findFirst({ where: { id: reminderId, userId } });
  if (!reminder) throw new Error('Not found');

  const date = startOfDay();
  await prisma.doseRecord.upsert({
    where: { reminderId_date: { reminderId, date } },
    update: { takenAt: new Date() },
    create: { reminderId, date, takenAt: new Date() },
  });

  revalidateAll();
}

export async function undoDose(reminderId: string) {
  const userId = await requireUserId();
  const reminder = await prisma.reminder.findFirst({ where: { id: reminderId, userId } });
  if (!reminder) throw new Error('Not found');

  const date = startOfDay();
  await prisma.doseRecord.upsert({
    where: { reminderId_date: { reminderId, date } },
    update: { takenAt: null },
    create: { reminderId, date, takenAt: null },
  });

  revalidateAll();
}
