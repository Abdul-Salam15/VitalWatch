import { Card } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/section-title';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';

export function AnalyzingCard() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <SectionTitle icon="sparkles" title="AI Analysis" />
        <Badge tone="green" className="bg-brand-light text-brand"><Icon name="zap" size={12} />VitalWatch AI</Badge>
      </div>
      <div className="mt-5 flex flex-col items-center justify-center py-6 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-light text-brand mb-4">
          <Icon name="loader-2" size={26} className="vw-spin" />
        </div>
        <p className="text-[15px] font-semibold text-slate-800">Analyzing with VitalWatch AI…</p>
        <p className="text-sm text-slate-500 mt-1">Reviewing your vitals against healthy ranges</p>
        <div className="mt-5 w-full max-w-xs space-y-2.5">
          <Skeleton className="h-3.5 w-full" /><Skeleton className="h-3.5 w-[88%]" /><Skeleton className="h-3.5 w-[94%]" />
        </div>
      </div>
    </Card>
  );
}
