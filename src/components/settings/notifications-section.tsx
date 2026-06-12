'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { Toggle } from '@/components/ui/toggle';
import { updateNotification } from '@/lib/actions/settings';
import type { NotifKey } from '@/lib/notification-fields';

interface NotificationsSectionProps {
  notif: Record<NotifKey, boolean>;
}

function NotifRow({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-slate-800">{title}</p>
        <p className="text-[13px] text-slate-500">{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export function NotificationsSection({ notif }: NotificationsSectionProps) {
  const [state, setState] = useState(notif);
  const [, startTransition] = useTransition();

  const upd = (key: NotifKey, value: boolean) => {
    setState((s) => ({ ...s, [key]: value }));
    startTransition(async () => {
      await updateNotification(key, value);
    });
  };

  return (
    <Card className="p-6">
      <SectionTitle icon="bell" title="Notifications" sub="Choose what you want to hear about" />
      <div className="mt-3 divide-y divide-slate-100">
        <NotifRow title="Enable Browser Notifications" desc="Get push reminders for upcoming doses in your browser" checked={state.notifBrowser} onChange={(v) => upd('notifBrowser', v)} />
        <NotifRow title="Email me medication reminders" desc="Send an email reminder to you when a dose becomes due" checked={state.notifMedReminderEmail} onChange={(v) => upd('notifMedReminderEmail', v)} />
        <NotifRow title="Email me my daily AI summary" desc="A morning digest of your vitals and AI analysis" checked={state.notifEmailSummary} onChange={(v) => upd('notifEmailSummary', v)} />
        <NotifRow title="Alert caregiver on missed / late dose" desc="Email your caregiver when a dose isn't taken within the escalation window" checked={state.notifCaregiverMissedDose} onChange={(v) => upd('notifCaregiverMissedDose', v)} />
        <NotifRow title="Notify caregiver on anomaly detection" desc="Automatically alert your caregiver when vitals are abnormal" checked={state.notifCaregiverAnomaly} onChange={(v) => upd('notifCaregiverAnomaly', v)} />
      </div>
    </Card>
  );
}
