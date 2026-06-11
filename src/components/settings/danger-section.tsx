'use client';

import { useState, useTransition } from 'react';
import { signOut } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { deleteAccount } from '@/lib/actions/settings';

export function DangerSection() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onDelete = () => startTransition(async () => {
    await deleteAccount();
    await signOut({ callbackUrl: '/login' });
  });

  return (
    <>
      <Card className="p-6 border-rose-200 bg-rose-50/40">
        <SectionTitle icon="alert-triangle" title="Danger Zone" sub="Irreversible account actions" />
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-rose-200 bg-white px-4 py-3.5">
          <div>
            <p className="text-sm font-semibold text-slate-800">Delete Account</p>
            <p className="text-[13px] text-slate-500">Permanently remove your account and all health data.</p>
          </div>
          <Button variant="destructive" icon="trash-2" onClick={() => setOpen(true)}>Delete Account</Button>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} icon="alert-triangle" title="Delete account?"
        description="This action cannot be undone."
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
          <Button variant="destructive" icon="trash-2" onClick={onDelete} loading={pending}>Yes, delete everything</Button>
        </>}>
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
          <Icon name="alert-circle" size={18} className="mt-0.5 text-rose-500" />
          <p className="text-sm text-rose-700">All of your vitals, reminders, and settings will be <span className="font-semibold">permanently deleted</span>.</p>
        </div>
      </Modal>
    </>
  );
}
