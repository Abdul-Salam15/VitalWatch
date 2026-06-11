'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { Icon } from '@/components/ui/icon';
import { DAYS, MONTHS } from '@/lib/dates';
import { isDueToday, doseState, type ReminderWithWeek } from '@/lib/medication';
import { DoseRow } from '@/components/medication/dose-row';
import { EmailPreviewModal, type EmailPreviewDose } from '@/components/medication/email-preview-modal';

interface TodayCheckInProps {
  reminders: ReminderWithWeek[];
  user: { name: string; email: string };
  caregiverName: string;
  caregiverEmail: string;
}

export function TodayCheckIn({ reminders, user, caregiverName, caregiverEmail }: TodayCheckInProps) {
  const [mail, setMail] = useState<{ kind: 'patient' | 'caregiver'; dose: EmailPreviewDose } | null>(null);
  const due = reminders.filter((r) => isDueToday(r));
  const taken = due.filter((r) => doseState(r).status === 'taken').length;
  const today = new Date();
  const dateLbl = `${DAYS[today.getDay()]}, ${MONTHS[today.getMonth()]} ${today.getDate()}`;

  const preview = (kind: 'patient' | 'caregiver', dose: EmailPreviewDose) => setMail({ kind, dose });

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle icon="calendar-check" title="Today's Check-In" sub={dateLbl} />
        {due.length > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${due.length ? (taken / due.length) * 100 : 0}%` }} />
            </div>
            <span className="text-sm font-bold text-slate-700 tabular-nums">{taken}/{due.length} taken</span>
          </div>
        )}
      </div>

      {due.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
          <Icon name="check-circle" size={16} className="text-emerald-500" />No medications scheduled for today.
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {due.map((r) => <DoseRow key={r.id} r={r} onPreview={preview} />)}
        </div>
      )}

      {due.length > 0 && taken === due.length && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm font-semibold text-emerald-700">
          <Icon name="check-circle" size={16} />All done for today — every dose checked in. Nice work.
        </div>
      )}

      <EmailPreviewModal open={!!mail} onClose={() => setMail(null)} kind={mail?.kind} dose={mail?.dose} user={user} caregiverName={caregiverName} caregiverEmail={caregiverEmail} />
    </Card>
  );
}
