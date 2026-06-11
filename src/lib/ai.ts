// ── AI vitals analysis ──────────────────────────────────────────────────────
// Rule-based implementation behind a small interface so a real model
// can be swapped in later without touching call sites.
import { hrStatus, spo2Status, tempStatus } from '@/lib/vitals';

export interface VitalsInput {
  hr: number;
  spo2: number;
  temp: number;
  steps: number;
}

export interface VitalsAnalysis {
  summary: string;
  anomalyFlag: boolean;
  recommendations: string[];
}

export interface AIProvider {
  analyzeVitals(entry: VitalsInput): VitalsAnalysis;
}

function buildSummary(entry: VitalsInput, flag: boolean): string {
  if (flag) {
    const tempNote = tempStatus(entry.temp) !== 'green' ? `Body temperature of ${entry.temp}°C warrants monitoring. ` : '';
    const spo2Note = spo2Status(entry.spo2) !== 'green' ? `Oxygen saturation at ${entry.spo2}% is below target. ` : '';
    return `One or more readings fall outside the optimal range. ${tempNote}${spo2Note}Continue tracking and contact your provider if symptoms develop.`;
  }
  const stepsNote = entry.steps < 8000
    ? `You logged ${entry.steps.toLocaleString()} steps — a short walk would help reach your 8,000 goal.`
    : 'Great activity level today.';
  return `Your vitals are within healthy ranges. Heart rate of ${entry.hr} BPM and SpO2 of ${entry.spo2}% look strong. ${stepsNote} No concerning patterns detected.`;
}

export function buildRecommendations(entry: VitalsInput & { anomalyFlag: boolean }): string[] {
  const recs: string[] = [];
  if (tempStatus(entry.temp) !== 'green') recs.push(`Body temperature is ${entry.temp}°C — monitor closely and stay hydrated.`);
  if (spo2Status(entry.spo2) !== 'green') recs.push(`Oxygen saturation at ${entry.spo2}% is below target — rest and recheck shortly.`);
  if (hrStatus(entry.hr) !== 'green') recs.push(`Heart rate of ${entry.hr} BPM is outside the normal range — avoid strain.`);
  recs.push(`Heart rate of ${entry.hr} BPM and SpO2 of ${entry.spo2}% recorded.`);
  if (entry.steps < 8000) recs.push(`You logged ${entry.steps.toLocaleString()} steps — aim for 8,000 with a short walk.`);
  else recs.push(`Great activity — ${entry.steps.toLocaleString()} steps logged today.`);
  if (!entry.anomalyFlag) recs.push('No concerning patterns detected in your latest readings.');
  return recs.slice(0, 4);
}

export class RuleBasedAIProvider implements AIProvider {
  analyzeVitals(entry: VitalsInput): VitalsAnalysis {
    const flag = hrStatus(entry.hr) === 'red' || spo2Status(entry.spo2) !== 'green' || tempStatus(entry.temp) !== 'green';
    const summary = buildSummary(entry, flag);
    const recommendations = buildRecommendations({ ...entry, anomalyFlag: flag });
    return { summary, anomalyFlag: flag, recommendations };
  }
}

export const aiProvider: AIProvider = new RuleBasedAIProvider();
