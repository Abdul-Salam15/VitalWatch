'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { StatGrid } from '@/components/dashboard/stat-card';
import { HealthTrends } from '@/components/dashboard/health-trends';
import { AISummaryCard } from '@/components/dashboard/ai-summary-card';
import { AdherenceCard } from '@/components/dashboard/adherence-card';
import { MedReminderBanner } from '@/components/medication/med-reminder-banner';
import { ReportModal } from '@/components/report/report-modal';
import type { ReportLog } from '@/components/report/patient-report';
import type { ReminderWithWeek } from '@/lib/medication';

interface DashboardPageProps {
  logs: ReportLog[];
  reminders: ReminderWithWeek[];
  now: Date;
  user: { name: string; email: string };
  caregiverName: string;
  caregiverEmail: string;
}

export function DashboardPage({ logs, reminders, now, user, caregiverName, caregiverEmail }: DashboardPageProps) {
  const router = useRouter();
  const [report, setReport] = useState(false);

  if (!logs.length) {
    return (
      <Card className="mt-2">
        <EmptyState icon="activity" title="No vitals logged yet" message="Start by logging today's readings to see your dashboard come to life."
          action={<Button icon="plus" onClick={() => router.push('/log-health')}>Log Now</Button>} />
      </Card>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Good morning,</p>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{user.name.split(' ')[0]} 👋</h2>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" icon="download" onClick={() => setReport(true)}>Export Report</Button>
          <Button icon="plus" onClick={() => router.push('/log-health')} className="hidden sm:inline-flex">Log Vitals</Button>
        </div>
      </div>

      <MedReminderBanner reminders={reminders} now={now} user={user} caregiverName={caregiverName} caregiverEmail={caregiverEmail} />

      <StatGrid logs={logs} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-6">
        <div className="lg:col-span-3 min-w-0"><HealthTrends logs={logs} /></div>
        <div className="lg:col-span-2 min-w-0"><AISummaryCard latest={logs[0]} /></div>
      </div>

      <AdherenceCard reminders={reminders} now={now} />

      <ReportModal open={report} onClose={() => setReport(false)} logs={logs} reminders={reminders} user={user} caregiverName={caregiverName} caregiverEmail={caregiverEmail} />
    </div>
  );
}
