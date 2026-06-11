'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { AuthShell } from '@/components/auth/auth-shell';
import { requestPasswordReset } from '@/lib/actions/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData();
    fd.set('email', email.trim());
    const result = await requestPasswordReset(undefined, fd);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell>
      <Card className="p-7 shadow-xl">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-light text-brand"><Icon name="mail" size={22} /></div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">Check your email</h1>
            <p className="mt-2 text-sm text-slate-500">If an account exists for <span className="font-semibold text-slate-700">{email}</span>, we&apos;ve sent a link to reset your password. The link expires in 1 hour.</p>
            <Link href="/login" className="mt-6 inline-block font-semibold text-brand hover:underline text-sm">Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-900">Forgot your password?</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your email and we&apos;ll send you a link to reset it.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <Field label="Email" error={error}>
                <Input leftIcon="mail" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={!!error} required />
              </Field>
              <Button type="submit" size="lg" loading={loading} className="w-full justify-center">Send reset link</Button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">Remembered your password? <Link href="/login" className="font-semibold text-brand hover:underline">Sign in</Link></p>
          </>
        )}
      </Card>
    </AuthShell>
  );
}
