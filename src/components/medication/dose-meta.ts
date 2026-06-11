import type { TodayDoseStatus } from '@/lib/medication';
import type { Tone } from '@/lib/vitals';

export const DOSE_META: Record<TodayDoseStatus, { tone: Tone; icon: string; label: string }> = {
  taken: { tone: 'green', icon: 'check-circle', label: 'Taken' },
  upcoming: { tone: 'slate', icon: 'clock', label: 'Upcoming' },
  late: { tone: 'amber', icon: 'bell', label: 'Overdue' },
  escalated: { tone: 'red', icon: 'alert-triangle', label: 'Not on time' },
  none: { tone: 'slate', icon: 'clock', label: 'Upcoming' },
};
