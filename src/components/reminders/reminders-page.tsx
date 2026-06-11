'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { TodayCheckIn } from '@/components/medication/today-checkin';
import { ReminderCard } from '@/components/reminders/reminder-card';
import { AdherenceTable } from '@/components/reminders/adherence-table';
import { ReminderDialog } from '@/components/reminders/reminder-dialog';
import type { ReminderWithWeek } from '@/lib/medication';

interface RemindersPageProps {
  reminders: ReminderWithWeek[];
  user: { name: string; email: string };
  caregiverName: string;
  caregiverEmail: string;
}

export function RemindersPage({ reminders, user, caregiverName, caregiverEmail }: RemindersPageProps) {
  const [add, setAdd] = useState(false);
  const activeCount = reminders.filter((r) => r.active).length;

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle icon="bell" title="Medication Schedule" sub={`${activeCount} active reminder${activeCount !== 1 ? 's' : ''}`} />
        <Button icon="plus" onClick={() => setAdd(true)}>Add Reminder</Button>
      </div>

      {reminders.length > 0 && <TodayCheckIn reminders={reminders} user={user} caregiverName={caregiverName} caregiverEmail={caregiverEmail} />}

      {reminders.length === 0 ? (
        <Card>
          <EmptyState icon="bell-ring" title="No reminders yet" message="Add your first medication to start tracking doses and adherence."
            action={<Button icon="plus" onClick={() => setAdd(true)}>Add Reminder</Button>} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 vw-stagger">
            {reminders.map((r) => <ReminderCard key={r.id} r={r} />)}
          </div>
          <AdherenceTable reminders={reminders} />
        </>
      )}

      <ReminderDialog open={add} onClose={() => setAdd(false)} editing={null} />
    </div>
  );
}
