'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { fmtTime12 } from '@/lib/dates';

export interface AlarmDose {
  id: string;
  name: string;
  dosage: string;
  time: string;
}

interface AlarmModalProps {
  alarm: AlarmDose | null;
  index: number;
  total: number;
  pending?: boolean;
  onTaken: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}

export function AlarmModal({ alarm, index, total, pending, onTaken, onSnooze, onDismiss }: AlarmModalProps) {
  return (
    <Modal
      open={!!alarm}
      onClose={onDismiss}
      dismissible={false}
      size="sm"
      title="Medication reminder"
      description={alarm && total > 1 ? `Dose ${index + 1} of ${total}` : 'Time to take your medication'}
      footer={
        <>
          <Button variant="ghost" onClick={onDismiss}>Dismiss</Button>
          <Button variant="white" icon="clock" onClick={onSnooze}>Snooze 5 min</Button>
          <Button icon="check" loading={pending} onClick={onTaken}>Mark as taken</Button>
        </>
      }
    >
      {alarm && (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="vw-pulse grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-500">
            <Icon name="bell-ring" size={28} />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{alarm.name}</p>
            <p className="text-sm text-slate-500">{alarm.dosage} · scheduled for {fmtTime12(alarm.time)}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
