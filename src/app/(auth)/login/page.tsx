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
import { useToast } from '@/components/ui/toast';

export default function LoginPage() {
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn('credentials', { email, password: pw, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError('Invalid email or password');
      return;
    }
    toast({ title: 'Welcome back!' });
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <AuthShell>
      <Card className="p-7 shadow-xl">
        <h1 className="text-xl font-bold text-slate-900">Sign in to your account</h1>
        <p className="text-sm text-slate-500 mt-1">Enter your credentials to continue.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Email">
            <Input leftIcon="mail" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password" error={error}>
            <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" error={!!error} />
          </Field>
          <div className="flex justify-end -mt-2">
            <Link href="/forgot-password" className="text-sm font-semibold text-brand hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" size="lg" loading={loading} className="w-full justify-center">Sign In</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Don&apos;t have an account? <Link href="/register" className="font-semibold text-brand hover:underline">Create one</Link></p>
      </Card>
    </AuthShell>
  );
}
