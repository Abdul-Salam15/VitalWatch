// ── Vital sign status thresholds & tone tokens ─────────────────────────────

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'slate';

export function hrStatus(v: number | null | undefined): Tone {
  if (v == null || isNaN(v as number)) return 'slate';
  if (v >= 60 && v <= 100) return 'green';
  if ((v >= 50 && v < 60) || (v > 100 && v <= 110)) return 'amber';
  return 'red';
}

export function spo2Status(v: number | null | undefined): Tone {
  if (v == null || isNaN(v as number)) return 'slate';
  if (v >= 95) return 'green';
  if (v >= 90) return 'amber';
  return 'red';
}

export function tempStatus(v: number | null | undefined): Tone {
  if (v == null || isNaN(v as number)) return 'slate';
  if (v >= 36 && v <= 37.5) return 'green';
  if (v > 37.5 && v <= 38.5) return 'amber';
  return 'red';
}

export function stepsStatus(): Tone {
  return 'blue';
}

export const TONES: Record<Tone, {
  text: string; bg: string; soft: string; icon: string; dot: string; border: string; ring: string; label: string;
}> = {
  green: { text: 'text-emerald-700', bg: 'bg-emerald-50', soft: 'bg-emerald-100', icon: 'text-emerald-600', dot: 'bg-emerald-500', border: 'border-emerald-200', ring: 'ring-emerald-500', label: 'Normal' },
  amber: { text: 'text-amber-700', bg: 'bg-amber-50', soft: 'bg-amber-100', icon: 'text-amber-500', dot: 'bg-amber-500', border: 'border-amber-200', ring: 'ring-amber-500', label: 'Borderline' },
  red: { text: 'text-rose-700', bg: 'bg-rose-50', soft: 'bg-rose-100', icon: 'text-rose-500', dot: 'bg-rose-500', border: 'border-rose-200', ring: 'ring-rose-500', label: 'Abnormal' },
  blue: { text: 'text-sky-700', bg: 'bg-sky-50', soft: 'bg-sky-100', icon: 'text-sky-500', dot: 'bg-sky-500', border: 'border-sky-200', ring: 'ring-sky-500', label: 'Tracking' },
  slate: { text: 'text-slate-600', bg: 'bg-slate-50', soft: 'bg-slate-100', icon: 'text-slate-400', dot: 'bg-slate-400', border: 'border-slate-200', ring: 'ring-slate-400', label: '—' },
};

export type AnomalyStatus = 'green' | 'amber' | 'red';

// Worst-case overall status across the 3 clinical vitals.
export function overallStatus(l: { hr: number; spo2: number; temp: number; anomalyFlag: boolean }): AnomalyStatus {
  if (!l.anomalyFlag) return 'green';
  if (tempStatus(l.temp) === 'red' || hrStatus(l.hr) === 'red' || spo2Status(l.spo2) === 'red') return 'red';
  return 'amber';
}
