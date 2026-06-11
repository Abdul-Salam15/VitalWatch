'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { Field, Input } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { updateCaregiver } from '@/lib/actions/settings';
import { useToast } from '@/components/ui/toast';

interface CaregiverSectionProps {
  caregiverName: string;
  caregiverEmail: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CaregiverSection({ caregiverName, caregiverEmail }: CaregiverSectionProps) {
  const toast = useToast();
  const [name, setName] = useState(caregiverName);
  const [email, setEmail] = useState(caregiverEmail);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const save = () => {
    if (email && !EMAIL_RE.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    startTransition(async () => {
      const fd = new FormData();
      fd.set('caregiverName', name.trim());
      fd.set('caregiverEmail', email.trim());
      const result = await updateCaregiver(undefined, fd);
      if (result.error) {
        setError(result.error);
        toast({ tone: 'error', title: result.error });
        return;
      }
      toast({ title: email ? 'Caregiver details saved' : 'Caregiver email cleared' });
    });
  };

  return (
    <Card className="p-6">
      <SectionTitle icon="users" title="Caregiver" sub="Who gets notified about your health" />
      <div className="mt-5 max-w-md space-y-4">
        <Field label="Caregiver Name">
          <Input placeholder="e.g. Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Caregiver Email" hint="This email receives missed dose alerts and anomaly notifications" error={error}>
          <Input leftIcon="mail" type="email" placeholder="caregiver@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} error={!!error} />
        </Field>
      </div>
      <div className="mt-5 flex justify-end"><Button onClick={save} loading={pending}>Save</Button></div>
    </Card>
  );
}
