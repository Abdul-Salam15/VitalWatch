'use client';

import { useRef, useState } from 'react';
import { LogForm } from '@/components/log-health/log-form';
import { AnalyzingCard } from '@/components/log-health/analyzing-card';
import { AIResultCard } from '@/components/log-health/ai-result-card';
import { RecentLogs } from '@/components/log-health/recent-logs';
import type { LogResult } from '@/components/log-health/types';

interface LogHealthPageProps {
  logs: {
    id: string;
    ts: Date | string;
    hr: number;
    spo2: number;
    temp: number;
    steps: number;
    summary: string;
    anomalyFlag: boolean;
  }[];
}

export function LogHealthPage({ logs }: LogHealthPageProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<LogResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const onResult = (log: LogResult) => {
    setAnalyzing(false);
    setResult(log);
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 items-start">
      <LogForm onAnalyzing={() => { setAnalyzing(true); setResult(null); }} onResult={onResult} />
      <div className="space-y-5 md:space-y-6">
        {analyzing && <AnalyzingCard />}
        {!analyzing && result && <AIResultCard ref={resultRef} log={result} />}
        <RecentLogs logs={logs} />
      </div>
    </div>
  );
}
