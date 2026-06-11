// ── Page: Dashboard ────────────────────────────────────────────────────────
function HealthTrends({ logs }) {
  const TABS = [
    { key: 'hr', label: 'Heart Rate', unit: 'BPM', color: '#1A6B3C', fmt: v => v },
    { key: 'spo2', label: 'SpO2', unit: '%', color: '#0EA5E9', fmt: v => v },
    { key: 'temp', label: 'Temperature', unit: '°C', color: '#F59E0B', fmt: v => v },
    { key: 'steps', label: 'Steps', unit: '', color: '#7C3AED', fmt: v => (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v) },
  ];
  const [tab, setTab] = React.useState(TABS[0]);
  const sorted = [...logs].sort((a, b) => new Date(a.ts) - new Date(b.ts));
  const data = sorted.map(l => ({ ts: l.ts, value: l[tab.key] }));

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SectionTitle icon="activity" title="Health Trends" sub="Last 14 days" />
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 overflow-x-auto vw-scroll">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t)}
              className={cx('whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors', tab.key === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800')}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <LineChartView data={data} color={tab.color} unit={tab.unit} valueFmt={tab.fmt} seriesKey={tab.key}
          refLine={tab.key === 'hr' ? { value: 100, label: 'Upper Normal', color: '#F59E0B' } : null} />
      </div>
    </Card>
  );
}

function DashboardPage() {
  const { logs, user, toast } = useStore();
  const [loading, setLoading] = React.useState(true);
  const [report, setReport] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setLoading(false), 650); return () => clearTimeout(t); }, []);

  const exportReport = () => setReport(true);

  if (!logs.length) {
    return (
      <Card className="mt-2">
        <EmptyState icon="activity" title="No vitals logged yet" message="Start by logging today's readings to see your dashboard come to life."
          action={<Button icon="plus" onClick={() => navigate('/log-health')}>Log Now</Button>} />
      </Card>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Good morning,</p>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{user.name.split(' ')[0]} 👋</h2>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" icon="download" onClick={exportReport}>Export Report</Button>
          <Button icon="plus" onClick={() => navigate('/log-health')} className="hidden sm:inline-flex">Log Vitals</Button>
        </div>
      </div>

      <MedReminderBanner />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <Card key={i} tone="light" className="p-5"><Skeleton className="h-4 w-20" /><Skeleton className="h-9 w-24 mt-4" /><Skeleton className="h-4 w-28 mt-4" /></Card>)}
        </div>
      ) : <StatGrid logs={logs} />}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-6">
        <div className="lg:col-span-3 min-w-0">
          {loading ? <Card className="p-6"><Skeleton className="h-6 w-40" /><Skeleton className="h-[280px] w-full mt-6" /></Card> : <HealthTrends logs={logs} />}
        </div>
        <div className="lg:col-span-2 min-w-0">
          {loading ? <Card className="p-6 h-full"><Skeleton className="h-6 w-32" /><Skeleton className="h-16 w-full mt-4 rounded-xl" /><Skeleton className="h-24 w-full mt-4" /></Card> : <AISummaryCard />}
        </div>
      </div>

      {loading ? <Card className="p-6"><Skeleton className="h-6 w-56" /><Skeleton className="h-12 w-full mt-5" /></Card> : <AdherenceCard />}

      <ReportModal open={report} onClose={() => setReport(false)} />
    </div>
  );
}

window.DashboardPage = DashboardPage;
