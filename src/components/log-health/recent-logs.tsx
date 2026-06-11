import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { EmptyState } from '@/components/ui/empty-state';
import { LogEntry } from '@/components/log-health/log-entry';

interface RecentLogsProps {
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

export function RecentLogs({ logs }: RecentLogsProps) {
  return (
    <Card className="p-6 flex flex-col" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
      <SectionTitle icon="clock" title="Recent Logs" sub={`${logs.length} total entries`} />
      {logs.length === 0 ? (
        <EmptyState icon="inbox" title="No logs yet" message="Your submitted readings will appear here." />
      ) : (
        <div className="mt-4 -mr-2 pr-2 space-y-3 overflow-y-auto vw-scroll">
          {logs.slice(0, 10).map((l) => <LogEntry key={l.id} log={l} />)}
        </div>
      )}
    </Card>
  );
}
