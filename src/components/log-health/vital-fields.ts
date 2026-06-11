import { hrStatus, spo2Status, tempStatus, stepsStatus, type Tone } from '@/lib/vitals';

export interface VitalField {
  key: 'hr' | 'spo2' | 'temp' | 'steps';
  label: string;
  unit: string;
  ph: string;
  step: string;
  range: string;
  check: (v: number) => Tone;
  min: number;
  max: number;
  msg: string;
}

export const VITAL_FIELDS: VitalField[] = [
  { key: 'hr', label: 'Heart Rate', unit: 'BPM', ph: 'e.g. 72', step: '1', range: 'Healthy range: 60–100 BPM', check: hrStatus, min: 20, max: 250, msg: 'Enter a value between 20 and 250 BPM' },
  { key: 'spo2', label: 'Blood Oxygen / SpO2', unit: '%', ph: 'e.g. 98', step: '1', range: 'Healthy range: 95–100%', check: spo2Status, min: 50, max: 100, msg: 'Enter a value between 50 and 100%' },
  { key: 'temp', label: 'Body Temperature', unit: '°C', ph: 'e.g. 36.6', step: '0.1', range: 'Healthy range: 36.0–37.5°C', check: tempStatus, min: 30, max: 45, msg: 'Enter a value between 30 and 45°C' },
  { key: 'steps', label: 'Steps Today', unit: 'steps', ph: 'e.g. 4500', step: '1', range: 'Daily goal: 8,000 steps', check: stepsStatus, min: 0, max: 100000, msg: 'Enter a value between 0 and 100,000' },
];
