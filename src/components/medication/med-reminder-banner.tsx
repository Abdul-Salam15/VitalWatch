'use client';

import { useState, useTransition } from 'react';
import { cx } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { fmtTime12 } from '@/lib/dates';
import { patientReminders, type ReminderWithWeek } from '@/lib/medication';
import { checkInDose } from '@/lib/actions/reminders';
import { useToast } from '@/components/ui/toast';
import { EmailPreviewModal, type EmailPreviewDose } from '@/components/medication/email-preview-modal';

interface MedReminderBannerProps {
  reminders: ReminderWithWeek[];
  now: Date;
  user: { name: string; email: string };
  caregiverName: string;
  caregiverEmail: string;
}

export function MedReminderBanner({ reminders, now, user, caregiverName, caregiverEmail }: MedReminderBannerProps) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [mail, setMail] = useState<{ kind: 'patient' | 'caregiver'; dose: EmailPreviewDose } | null>(null);
  const overdue = patientReminders(reminders, now);
  if (overdue.length === 0) return null;
  const escalated = overdue.some((x) => x.st.status === 'escalated');

  const markTaken = (id: string, name: string) => startTransition(async () => {
    await checkInDose(id);
    toast({ tone: 'success', title: `${name} marked as taken` });
  });

  return (
    <Card className={cx('p-5 border-l-4', escalated ? 'border-l-rose-500' : 'border-l-amber-400')}>
      <div className="flex items-start gap-3">
        <div className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', escalated ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500')}>
          <Icon name="bell-ring" size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-slate-900">{overdue.length === 1 ? 'A medication is due' : `${overdue.length} medications are due`}</p>
          <p className="text-[13px] text-slate-500">
            {escalated ? 'A dose is past its escalation window — your caregiver has been notified.' : 'You have a reminder waiting. Check in once you’ve taken it.'}
          </p>
          <div className="mt-3 space-y-2">
            {overdue.map(({ r, st }) => (
              <div key={r.id} className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
                <Icon name="pill" size={16} className={st.status === 'escalated' ? 'text-rose-500' : 'text-amber-500'} />
                <span className="text-sm font-semibold text-slate-800">{r.name}</span>
                <span className="text-sm text-slate-500">{r.dosage} · {fmtTime12(r.time)}</span>
                <button
                  onClick={() => setMail({ kind: st.status === 'escalated' ? 'caregiver' : 'patient', dose: { name: r.name, dosage: r.dosage, time: r.time, escalation: r.escalation, overdueMin: st.overdueMin } })}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline underline-offset-2"
                >
                  <Icon name={st.status === 'escalated' ? 'mail-check' : 'mail'} size={12} />view email
                </button>
                <Button size="sm" icon="check" className="ml-auto" loading={pending} onClick={() => markTaken(r.id, r.name)}>Mark taken</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <EmailPreviewModal open={!!mail} onClose={() => setMail(null)} kind={mail?.kind} dose={mail?.dose} user={user} caregiverName={caregiverName} caregiverEmail={caregiverEmail} />
    </Card>
  );
}
