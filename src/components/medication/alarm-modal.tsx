'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { fmtTime12 } from '@/lib/dates';
import type { ReminderWithWeek } from '@/lib/medication';

interface AlarmModalProps {
  alarm: ReminderWithWeek | null;
  queueLength: number;
  pending: boolean;
  onMarkTaken: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}

export function AlarmModal({ alarm, queueLength, pending, onMarkTaken, onSnooze, onDismiss }: AlarmModalProps) {
  return (
    <Modal open={!!alarm} onClose={onDismiss} dismissible={false} size="sm">
      {alarm && (
        <div className="flex flex-col items-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-light text-brand vw-pulse">
            <Icon name="bell-ring" size={30} />
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-brand">
            {queueLength > 1 ? `Medication reminder · 1 of ${queueLength}` : 'Medication reminder'}
          </p>
          <h3 className="mt-1 text-xl font-extrabold text-slate-900">{alarm.name}</h3>
          <p className="text-sm text-slate-500">{alarm.dosage} · scheduled for {fmtTime12(alarm.time)}</p>
          <p className="mt-3 text-[15px] text-slate-600">It&apos;s time to take your medication.</p>

          <div className="mt-6 flex w-full flex-col gap-2.5">
            <Button size="lg" icon="check" className="w-full justify-center" loading={pending} onClick={onMarkTaken}>Mark as taken</Button>
            <div className="flex gap-2.5">
              <Button variant="outline" size="md" icon="clock" className="flex-1 justify-center" disabled={pending} onClick={onSnooze}>Snooze 5 min</Button>
              <Button variant="ghost" size="md" className="flex-1 justify-center" disabled={pending} onClick={onDismiss}>Dismiss</Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
