// ── Shared widgets: stat cards, AI summary, adherence bar ──────────────────

function TrendChip({ value }) {
  const dir = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const map = {
    up: { icon: 'trending-up', cls: 'text-emerald-600 bg-emerald-50' },
    down: { icon: 'trending-down', cls: 'text-rose-600 bg-rose-50' },
    flat: { icon: 'minus', cls: 'text-slate-500 bg-slate-100' },
  }[dir];
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold', map.cls)}>
      <Icon name={map.icon} size={12} strokeWidth={2.5} />{value > 0 ? '+' : ''}{value}%
    </span>
  );
}

function StatCard({ icon, iconFill, label, value, unit, tone, trend, readOnly }) {
  const t = TONES[tone] || TONES.slate;
  return (
    <Card tone="light" className={cx('p-5 relative', !readOnly && 'transition-shadow hover:shadow-md')}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <span className={cx('h-2 w-2 rounded-full', t.dot)} />
          <span className="text-[13px] font-semibold text-slate-500">{label}</span>
        </div>
        <div className={cx('grid h-9 w-9 place-items-center rounded-xl bg-white shadow-sm', t.icon)}>
          <Icon name={icon} size={18} fill={!!iconFill} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-[34px] leading-none font-extrabold tracking-tight text-slate-900 tabular-nums">{value}</span>
        <span className="text-sm font-semibold text-slate-400">{unit}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {trend !== undefined && <TrendChip value={trend} />}
        <span className="text-xs text-slate-400">vs. yesterday</span>
      </div>
    </Card>
  );
}

function StatGrid({ logs, readOnly }) {
  const latest = logs[0] || {};
  const prev = logs[1] || latest;
  const pct = (a, b) => (b ? Math.round(((a - b) / b) * 100) : 0);
  const cards = [
    { icon: 'heart', iconFill: true, label: 'Heart Rate', value: latest.hr, unit: 'BPM', tone: hrStatus(latest.hr), trend: pct(latest.hr, prev.hr) },
    { icon: 'droplet', iconFill: true, label: 'SpO2', value: latest.spo2, unit: '%', tone: spo2Status(latest.spo2), trend: pct(latest.spo2, prev.spo2) },
    { icon: 'thermometer', label: 'Temperature', value: latest.temp, unit: '°C', tone: tempStatus(latest.temp), trend: pct(latest.temp, prev.temp) },
    { icon: 'footprints', label: 'Steps Today', value: (latest.steps || 0).toLocaleString(), unit: 'steps', tone: 'blue', trend: pct(latest.steps, prev.steps) },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 vw-stagger">
      {cards.map((c, i) => <StatCard key={i} {...c} readOnly={readOnly} />)}
    </div>
  );
}

// ---- AI summary -----------------------------------------------------------
const BANNERS = {
  green: { tone: 'green', icon: 'check-circle', label: 'All Clear', text: 'No anomalies detected in your latest readings.' },
  amber: { tone: 'amber', icon: 'alert-triangle', label: 'Monitor Closely', text: 'Some readings warrant continued observation.' },
  red: { tone: 'red', icon: 'alert-circle', label: 'Attention Needed', text: 'Readings outside normal range — review recommended.' },
};

function AISummaryCard({ compact }) {
  const { logs } = useStore();
  const latest = logs[0] || {};
  const [analyzing, setAnalyzing] = React.useState(false);
  const status = latest.anomalyFlag ? (tempStatus(latest.temp) === 'red' || hrStatus(latest.hr) === 'red' || spo2Status(latest.spo2) === 'red' ? 'red' : 'amber') : 'green';
  const banner = BANNERS[status];
  const bt = TONES[banner.tone];

  const reanalyze = () => { setAnalyzing(true); setTimeout(() => setAnalyzing(false), 1600); };

  return (
    <Card className="p-6 flex flex-col h-full">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle icon="sparkles" title="AI Analysis" />
        <Badge tone="green" className="bg-brand-light text-brand"><Icon name="zap" size={12} />Powered by Gemini</Badge>
      </div>

      <div className={cx('mt-4 flex items-center gap-3 rounded-xl border px-4 py-3', bt.bg, bt.border)}>
        <div className={cx('grid h-9 w-9 place-items-center rounded-lg bg-white', bt.text)}><Icon name={banner.icon} size={18} /></div>
        <div>
          <p className={cx('text-sm font-bold', bt.text)}>{banner.label}</p>
          <p className="text-xs text-slate-500">{banner.text}</p>
        </div>
      </div>

      <div className="mt-4 flex-1">
        {analyzing ? (
          <div className="space-y-2.5 pt-1">
            <Skeleton className="h-3.5 w-full" /><Skeleton className="h-3.5 w-[92%]" /><Skeleton className="h-3.5 w-[97%]" /><Skeleton className="h-3.5 w-3/4" />
            <p className="flex items-center gap-2 pt-2 text-sm font-medium text-brand"><Icon name="loader-2" size={15} className="vw-spin" />Analyzing with Gemini AI…</p>
          </div>
        ) : (
          <p className="text-[15px] leading-relaxed text-slate-600" style={{ textWrap: 'pretty' }}>{latest.summary}</p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-400">Last analysis {latest.ts ? relTime(latest.ts) : '—'}</span>
        <Button variant="outline" size="sm" icon="rotate-cw" loading={analyzing} onClick={reanalyze}>Re-analyze</Button>
      </div>
    </Card>
  );
}

// ---- Adherence bar (7 day pills) -----------------------------------------
const ADH = {
  taken: { cls: 'bg-emerald-500 text-white', icon: 'check', label: 'Taken' },
  missed: { cls: 'bg-rose-500 text-white', icon: 'x', label: 'Missed' },
  pending: { cls: 'bg-amber-400 text-white', icon: 'clock', label: 'Pending' },
  none: { cls: 'bg-slate-100 text-slate-300', icon: 'minus', label: 'No dose' },
};

function AdherenceWeek({ states, withIcons = true, size = 'md' }) {
  const h = size === 'sm' ? 'h-8' : 'h-11';
  return (
    <div className="grid grid-cols-7 gap-2">
      {WEEK.map((day, i) => {
        const a = ADH[states[i]] || ADH.none;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className={cx('w-full rounded-lg grid place-items-center font-bold', h, a.cls)}>
              {withIcons && <Icon name={a.icon} size={size === 'sm' ? 13 : 16} strokeWidth={2.5} />}
            </div>
            <span className="text-[11px] font-semibold text-slate-400">{day}</span>
          </div>
        );
      })}
    </div>
  );
}

function AdherenceCard() {
  const { reminders } = useStore();
  const pct = weekAdherence(reminders);
  const states = combinedWeek(reminders);
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <SectionTitle icon="pill" title="Medication Adherence" sub="This week" />
        <div className="text-right">
          <div className="text-2xl font-extrabold text-brand tabular-nums">{pct}%</div>
          <div className="text-xs font-semibold text-slate-400">adherence</div>
        </div>
      </div>
      <div className="mt-5"><AdherenceWeek states={states} /></div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
        {[['taken','Taken'],['missed','Missed'],['pending','Pending'],['none','No dose']].map(([k,l]) => (
          <span key={k} className="inline-flex items-center gap-1.5"><span className={cx('h-2.5 w-2.5 rounded-sm', ADH[k].cls.split(' ')[0])} />{l}</span>
        ))}
      </div>
    </Card>
  );
}

Object.assign(window, { TrendChip, StatCard, StatGrid, AISummaryCard, AdherenceWeek, AdherenceCard, BANNERS, ADH });
