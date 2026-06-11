export interface LogResult {
  hr: number;
  spo2: number;
  temp: number;
  steps: number;
  summary: string;
  anomalyFlag: boolean;
  recommendations: string[];
  ts: string;
}
