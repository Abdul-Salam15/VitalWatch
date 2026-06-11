'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { Field, Input } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { updateProfile } from '@/lib/actions/settings';
import { useToast } from '@/components/ui/toast';

interface ProfileSectionProps {
  user: { name: string; email: string };
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [pending, startTransition] = useTransition();
  const dirty = name.trim() !== user.name;

  const save = () => startTransition(async () => {
    const fd = new FormData();
    fd.set('name', name.trim());
    const result = await updateProfile(undefined, fd);
    if (result.error) toast({ tone: 'error', title: result.error });
    else toast({ title: 'Profile saved' });
  });

  return (
    <Card className="p-6">
      <SectionTitle icon="user" title="Profile" sub="Manage your personal information" />
      <div className="mt-5 flex flex-col sm:flex-row gap-6">
        <div className="group relative w-fit">
          <Avatar name={name} size={72} />
          <button className="absolute inset-0 grid place-items-center rounded-full bg-slate-900/55 text-white opacity-0 group-hover:opacity-100 transition" title="Edit avatar">
            <Icon name="pencil" size={18} />
          </button>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email">
            <div className="relative">
              <Input value={user.email} readOnly className="bg-slate-50 text-slate-500 pr-10" />
              <Icon name="lock" size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </Field>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Button disabled={!dirty} loading={pending} onClick={save}>Save Changes</Button>
      </div>
    </Card>
  );
}
