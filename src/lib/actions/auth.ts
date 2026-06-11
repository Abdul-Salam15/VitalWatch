'use server';

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email/send';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export interface RegisterResult {
  error?: string;
  success?: boolean;
}

export async function registerUser(_prevState: RegisterResult | undefined, formData: FormData): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: 'An account with this email already exists.' };
  }

  const password = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, password },
  });

  return { success: true };
}

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});

export interface ForgotPasswordResult {
  error?: string;
  success?: boolean;
}

export async function requestPasswordReset(_prevState: ForgotPasswordResult | undefined, formData: FormData): Promise<ForgotPasswordResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Always return success to avoid leaking which emails have accounts.
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: tokenHash, resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });
    await sendPasswordResetEmail({ to: user.email, name: user.name, token });
  }

  return { success: true };
}

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Missing reset token'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export interface ResetPasswordResult {
  error?: string;
  success?: boolean;
}

export async function resetPassword(_prevState: ResetPasswordResult | undefined, formData: FormData): Promise<ResetPasswordResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid input' };
  }

  const tokenHash = crypto.createHash('sha256').update(parsed.data.token).digest('hex');
  const user = await prisma.user.findFirst({
    where: { resetToken: tokenHash, resetTokenExpiry: { gt: new Date() } },
  });
  if (!user) {
    return { error: 'This reset link is invalid or has expired.' };
  }

  const password = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password, resetToken: null, resetTokenExpiry: null },
  });

  return { success: true };
}
