'use client';

import { useState } from 'react';
import { cx } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { StatGrid, type VitalLogLite } from '@/components/dashboard/stat-card';
import { AISummaryCard, type AISummaryLog } from '@/components/dashboard/ai-summary-card';
import { HealthTrends } from '@/components/dashboard/health-trends';
import { CaregiverMeds } from '@/components/caregiver/caregiver-meds';
import { EmailPreviewModal, type EmailPreviewDose } from '@/components/medication/email-preview-modal';
import { caregiverAlerts, type ReminderWithWeek } from '@/lib/medication';
import { fmtDate, relTime } from '@/lib/dates';

export interface CaregiverLog extends VitalLogLite, AISummaryLog {
  id: string;
}

interface CaregiverPreviewProps {
  logs: CaregiverLog[];
  reminders: ReminderWithWeek[];
  now: Date;
  user: { name: string; email: string };
  caregiverName: string;
  caregiverEmail: string;
}

export function CaregiverPreview({ logs, reminders, now, user, caregiverName, caregiverEmail }: CaregiverPreviewProps) {
  const alerts = caregiverAlerts(logs, reminders, now);
  const [mail, setMail] = useState<EmailPreviewDose | null>(null);
  const medCount = alerts.filter((a) => a.kind === 'med').length;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 bg-slate-900 px-6 py-3 text-white">
        <Icon name="eye" size={16} />
        <span className="text-sm font-semibold">Caregiver View — Read Only</span>
        <span className="ml-auto text-xs text-slate-300 font-mono">{caregiverName}</span>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size={48} />
            <div>
              <p className="text-lg font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-400">Last active {logs[0] ? relTime(logs[0].ts) : '—'}</p>
            </div>
          </div>
          <Badge tone="green" dot>Monitoring</Badge>
        </div>

        <div className="pointer-events-none select-none"><StatGrid logs={logs} readOnly /></div>

        <HealthTrends logs={logs} />

        <div className="pointer-events-none"><CaregiverMeds reminders={reminders} now={now} /></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {logs[0] && <div className="pointer-events-none"><AISummaryCard latest={logs[0]} /></div>}
          <Card className="p-6">
            <SectionTitle icon="alert-triangle" title="Anomaly & Adherence Alerts" sub={`${alerts.length} flagged · ${medCount} medication`} />
            <div className="mt-4 space-y-2.5">
              {alerts.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-4"><Icon name="check-circle" size={16} className="text-emerald-500" />No anomalies in recent history</div>
              ) : alerts.map((a) => {
                const isMed = a.kind === 'med';
                return (
                  <div key={a.id} className={cx('flex items-start gap-3 rounded-xl border px-3.5 py-2.5', isMed ? 'border-rose-100 bg-rose-50/50' : 'border-amber-100 bg-amber-50/50')}>
                    <Icon name={isMed ? 'pill' : 'alert-triangle'} size={16} className={cx('mt-0.5 shrink-0', isMed ? 'text-rose-500' : 'text-amber-500')} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700">{a.reason}</p>
                      {isMed && (
                        <button onClick={() => setMail({ name: a.name!, dosage: a.dosage!, time: a.time!, escalation: a.escalation })}
                          className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-semibold text-rose-600 hover:underline underline-offset-2">
                          <Icon name="mail-check" size={12} />Caregiver emailed · view
                        </button>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-slate-400 whitespace-nowrap">{fmtDate(a.ts)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
      <EmailPreviewModal open={!!mail} onClose={() => setMail(null)} kind="caregiver" dose={mail} user={user} caregiverName={caregiverName} caregiverEmail={caregiverEmail} />
    </Card>
  );
}
