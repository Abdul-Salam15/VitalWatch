'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordInput } from '@/components/auth/password-input';
import { registerUser } from '@/lib/actions/auth';
import { useToast } from '@/components/ui/toast';

interface FormState {
  name: string;
  email: string;
  pw: string;
  confirm: string;
}

const BLANK: FormState = { name: '', email: '', pw: '', confirm: '' };

export default function RegisterPage() {
  const toast = useToast();
  const router = useRouter();
  const [f, setF] = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setF((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.name.trim()) er.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) er.email = 'Enter a valid email';
    if (f.pw.length < 8) er.pw = 'At least 8 characters';
    if (f.confirm !== f.pw) er.confirm = 'Passwords do not match';
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    const fd = new FormData();
    fd.set('name', f.name.trim());
    fd.set('email', f.email.trim());
    fd.set('password', f.pw);
    const result = await registerUser(undefined, fd);
    if (result.error) {
      setLoading(false);
      setErrors({ email: result.error });
      return;
    }

    const signInResult = await signIn('credentials', { email: f.email, password: f.pw, redirect: false });
    setLoading(false);
    if (signInResult?.error) {
      toast({ title: 'Account created — please sign in' });
      router.push('/login');
      return;
    }
    toast({ title: 'Account created!' });
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <AuthShell>
      <Card className="p-7 shadow-xl">
        <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1">Start monitoring your health in minutes.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Full Name" error={errors.name}>
            <Input leftIcon="user" placeholder="Jane Doe" value={f.name} onChange={(e) => set('name', e.target.value)} error={!!errors.name} />
          </Field>
          <Field label="Email" error={errors.email}>
            <Input leftIcon="mail" type="email" placeholder="you@example.com" value={f.email} onChange={(e) => set('email', e.target.value)} error={!!errors.email} />
          </Field>
          <Field label="Password" error={errors.pw}>
            <PasswordInput value={f.pw} onChange={(e) => set('pw', e.target.value)} placeholder="At least 8 characters" error={!!errors.pw} />
          </Field>
          <Field label="Confirm Password" error={errors.confirm}>
            <PasswordInput value={f.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="Re-enter password" error={!!errors.confirm} />
          </Field>
          <Button type="submit" size="lg" loading={loading} className="w-full justify-center">Create Account</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-brand hover:underline">Sign in</Link></p>
      </Card>
    </AuthShell>
  );
}
