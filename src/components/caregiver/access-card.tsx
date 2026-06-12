'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { regenerateAccessToken } from '@/lib/actions/settings';
import { useToast } from '@/components/ui/toast';

interface AccessCardProps {
  accessToken: string;
  caregiverEmail: string;
}

export function AccessCard({ accessToken, caregiverEmail }: AccessCardProps) {
  const toast = useToast();
  const [token, setToken] = useState(accessToken);
  const [pending, startTransition] = useTransition();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${appUrl}/caregiver/${token}`;

  const copy = () => {
    navigator.clipboard?.writeText(url).catch(() => {});
    toast({ title: 'Link copied to clipboard', message: 'Share it with your caregiver or doctor.' });
  };

  const revoke = () => startTransition(async () => {
    const newToken = await regenerateAccessToken();
    setToken(newToken);
    toast({ tone: 'warning', title: 'Access revoked', message: 'A new link has been generated.' });
  });

  return (
    <Card className="p-6">
      <SectionTitle icon="link" title="Your Caregiver Access" />
      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">Share this link with your caregiver or doctor to give them read-only access to your health data.</p>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="link" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input readOnly value={url} className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 h-11 text-sm text-slate-500 font-mono" />
        </div>
        <div className="flex gap-2">
          <Button icon="copy" onClick={copy}>Copy Link</Button>
          <Button variant="destructive-outline" icon="x-circle" onClick={revoke} loading={pending}>Revoke</Button>
        </div>
      </div>

      {!caregiverEmail && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Icon name="alert-triangle" size={18} className="mt-0.5 text-amber-500" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800">No caregiver email registered</p>
            <p className="text-amber-700">Add one in <Link href="/settings" className="font-semibold underline underline-offset-2">Settings</Link> to receive escalation alerts.</p>
          </div>
        </div>
      )}
    </Card>
  );
}
