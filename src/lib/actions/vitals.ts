'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { aiProvider } from '@/lib/ai';
import { anomalyReason } from '@/lib/medication';
import { sendCaregiverVitalAlertEmail } from '@/lib/email/send';
import { dateKey, zonedDate } from '@/lib/dates';

const logSchema = z.object({
  hr: z.coerce.number().min(20).max(250),
  spo2: z.coerce.number().min(50).max(100),
  temp: z.coerce.number().min(30).max(45),
  steps: z.coerce.number().min(0).max(100000),
});

export interface AddLogResult {
  error?: string;
  summary?: string;
  anomalyFlag?: boolean;
  recommendations?: string[];
}

export async function addVitalLog(_prev: AddLogResult | undefined, formData: FormData): Promise<AddLogResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized' };

  const parsed = logSchema.safeParse({
    hr: formData.get('hr'),
    spo2: formData.get('spo2'),
    temp: formData.get('temp'),
    steps: formData.get('steps'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Invalid input' };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: 'Unauthorized' };

  // Steps are a cumulative daily total (like a pedometer reading), so a new
  // entry for today can't be lower than one already logged today.
  const todayKey = dateKey(zonedDate(user.timezone));
  const todaysLogs = await prisma.vitalLog.findMany({
    where: { userId: user.id },
    orderBy: { ts: 'desc' },
    take: 10,
    select: { ts: true, steps: true },
  });
  const maxStepsToday = todaysLogs
    .filter((l) => dateKey(zonedDate(user.timezone, l.ts)) === todayKey)
    .reduce((max, l) => Math.max(max, l.steps), 0);

  if (parsed.data.steps < maxStepsToday) {
    return { error: `Steps can't be lower than today's earlier reading of ${maxStepsToday.toLocaleString()}.` };
  }

  const { summary, anomalyFlag, recommendations } = aiProvider.analyzeVitals(parsed.data);

  const log = await prisma.vitalLog.create({
    data: {
      userId: session.user.id,
      hr: parsed.data.hr,
      spo2: parsed.data.spo2,
      temp: parsed.data.temp,
      steps: parsed.data.steps,
      summary,
      anomalyFlag,
    },
  });

  if (anomalyFlag) {
    if (user.notifCaregiverAnomaly && user.caregiverEmail) {
      try {
        await sendCaregiverVitalAlertEmail({
          to: user.caregiverEmail,
          patientName: user.name,
          caregiverName: user.caregiverName || 'a designated caregiver',
          reason: anomalyReason(parsed.data),
          hr: parsed.data.hr,
          spo2: parsed.data.spo2,
          temp: parsed.data.temp,
          ts: log.ts,
        });
      } catch (err) {
        console.error('[vitals] failed to send caregiver anomaly alert:', err);
      }
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/log-health');
  revalidatePath('/caregiver');

  return { summary, anomalyFlag, recommendations };
}

export async function deleteVitalLog(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.vitalLog.deleteMany({ where: { id, userId: session.user.id } });

  revalidatePath('/dashboard');
  revalidatePath('/log-health');
  revalidatePath('/caregiver');
}
