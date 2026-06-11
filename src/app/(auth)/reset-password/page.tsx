'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordInput } from '@/components/auth/password-input';
import { resetPassword } from '@/lib/actions/auth';
import { useToast } from '@/components/ui/toast';

function ResetPasswordForm() {
  const toast = useToast();
  const router = useRouter();
  const token = useSearchParams().get('token') || '';
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600"><Icon name="alert-circle" size={22} /></div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Invalid reset link</h1>
        <p className="mt-2 text-sm text-slate-500">This password reset link is missing or malformed. Request a new one below.</p>
        <Link href="/forgot-password" className="mt-6 inline-block font-semibold text-brand hover:underline text-sm">Request a new link</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-light text-brand"><Icon name="check-circle" size={22} /></div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Password updated</h1>
        <p className="mt-2 text-sm text-slate-500">Your password has been reset. You can now sign in with your new password.</p>
        <Link href="/login" className="mt-6 inline-block font-semibold text-brand hover:underline text-sm">Go to sign in</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (pw.length < 8) er.pw = 'At least 8 characters';
    if (confirm !== pw) er.confirm = 'Passwords do not match';
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    const fd = new FormData();
    fd.set('token', token);
    fd.set('password', pw);
    const result = await resetPassword(undefined, fd);
    setLoading(false);
    if (result.error) {
      toast({ title: result.error, tone: 'error' });
      return;
    }
    setDone(true);
    router.refresh();
  };

  return (
    <>
      <h1 className="text-xl font-bold text-slate-900">Choose a new password</h1>
      <p className="text-sm text-slate-500 mt-1">Enter a new password for your account.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="New Password" error={errors.pw}>
          <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" error={!!errors.pw} />
        </Field>
        <Field label="Confirm Password" error={errors.confirm}>
          <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" error={!!errors.confirm} />
        </Field>
        <Button type="submit" size="lg" loading={loading} className="w-full justify-center">Reset password</Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Card className="p-7 shadow-xl">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </AuthShell>
  );
}
