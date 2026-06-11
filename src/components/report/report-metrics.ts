import { fmtDate } from '@/lib/dates';
import { hrStatus, spo2Status, tempStatus, type Tone } from '@/lib/vitals';

export interface ReportMetric {
  key: 'hr' | 'spo2' | 'temp' | 'steps';
  label: string;
  unit: string;
  color: string;
  normal: string;
  status: (v: number | null | undefined) => Tone;
  dec: number;
}

export const REPORT_METRICS: ReportMetric[] = [
  { key: 'hr', label: 'Heart Rate', unit: 'BPM', color: '#1A6B3C', normal: '60–100 BPM', status: (v) => hrStatus(v), dec: 0 },
  { key: 'spo2', label: 'Blood Oxygen · SpO₂', unit: '%', color: '#0EA5E9', normal: '95–100 %', status: (v) => spo2Status(v), dec: 0 },
  { key: 'temp', label: 'Body Temperature', unit: '°C', color: '#F59E0B', normal: '36.0–37.5 °C', status: (v) => tempStatus(v), dec: 1 },
  { key: 'steps', label: 'Daily Steps', unit: 'steps', color: '#7C3AED', normal: '8,000 goal', status: () => 'blue', dec: 0 },
];

export function fmtNum(v: number | null | undefined, dec: number): string {
  if (v == null || isNaN(v)) return '—';
  if (dec === 0) return Math.round(v).toLocaleString();
  return (Math.round(v * 10) / 10).toFixed(dec);
}

export type ReportPreset = 'last7' | 'last14' | 'last30' | 'last90' | 'all' | 'custom';

export interface ReportRange {
  preset: ReportPreset;
  from: string;
  to: string;
}

export interface RangeBounds {
  from: Date | null;
  to: Date | null;
}

export function rangeBounds(range: ReportRange | null | undefined): RangeBounds {
  if (!range) return { from: null, to: null };
  if (range.preset === 'custom') {
    return {
      from: range.from ? new Date(range.from + 'T00:00:00') : null,
      to: range.to ? new Date(range.to + 'T23:59:59') : null,
    };
  }
  const days = { last7: 7, last14: 14, last30: 30, last90: 90 }[range.preset as 'last7' | 'last14' | 'last30' | 'last90'];
  if (!days) return { from: null, to: null }; // all time
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);
  return { from, to: null };
}

export function inRange(ts: string | number | Date, b: RangeBounds): boolean {
  const d = new Date(ts);
  return (!b.from || d >= b.from) && (!b.to || d <= b.to);
}

export function presetLabel(range: ReportRange | null | undefined, b: RangeBounds): string {
  if (range?.preset === 'custom') return `${b.from ? fmtDate(b.from) : 'Start'} – ${b.to ? fmtDate(b.to) : 'Today'}`;
  const labels: Record<ReportPreset, string> = {
    last7: 'Last 7 days',
    last14: 'Last 14 days',
    last30: 'Last 30 days',
    last90: 'Last 90 days',
    all: 'All time',
    custom: 'Custom range',
  };
  return labels[range?.preset || 'all'] || 'All time';
}
