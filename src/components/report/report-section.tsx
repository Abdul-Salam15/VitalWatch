interface ReportSectionProps {
  n: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}

export function ReportSection({ n, title, sub, children }: ReportSectionProps) {
  return (
    <section className="vw-report-section mt-8">
      <div className="flex items-baseline gap-2.5 border-b-2 border-slate-900 pb-2">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-brand text-[12px] font-bold text-white">{n}</span>
        <h2 className="text-[17px] font-extrabold tracking-tight text-slate-900">{title}</h2>
        {sub && <span className="ml-auto text-[12px] font-medium text-slate-400">{sub}</span>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
