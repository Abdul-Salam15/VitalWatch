// ── Page: Log Health ───────────────────────────────────────────────────────
const VITAL_FIELDS = [
  { key: 'hr', label: 'Heart Rate', unit: 'BPM', ph: 'e.g. 72', step: '1', range: 'Healthy range: 60–100 BPM', check: hrStatus, min: 20, max: 250, msg: 'Enter a value between 20 and 250 BPM' },
  { key: 'spo2', label: 'Blood Oxygen / SpO2', unit: '%', ph: 'e.g. 98', step: '1', range: 'Healthy range: 95–100%', check: spo2Status, min: 50, max: 100, msg: 'Enter a value between 50 and 100%' },
  { key: 'temp', label: 'Body Temperature', unit: '°C', ph: 'e.g. 36.6', step: '0.1', range: 'Healthy range: 36.0–37.5°C', check: tempStatus, min: 30, max: 45, msg: 'Enter a value between 30 and 45°C' },
  { key: 'steps', label: 'Steps Today', unit: 'steps', ph: 'e.g. 4500', step: '1', range: 'Daily goal: 8,000 steps', check: stepsStatus, min: 0, max: 100000, msg: 'Enter a value between 0 and 100,000' },
];

function LogForm({ onAnalyzing, onResult }) {
  const { actions, toast } = useStore();
  const [vals, setVals] = React.useState({ hr: '', spo2: '', temp: '', steps: '' });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const set = (k, v) => { setVals(s => ({ ...s, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

  const validate = () => {
    const e = {};
    VITAL_FIELDS.forEach(f => {
      const v = vals[f.key];
      if (v === '' || v == null) e[f.key] = 'This field is required';
      else if (+v < f.min || +v > f.max || isNaN(+v)) e[f.key] = f.msg;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) { toast({ tone: 'error', title: 'Please fix the highlighted fields' }); return; }
    setLoading(true);
    onAnalyzing && onAnalyzing();
    setTimeout(() => {
      const log = actions.addLog(vals);
      setLoading(false);
      setVals({ hr: '', spo2: '', temp: '', steps: '' });
      onResult && onResult(log);
      toast({ tone: log.anomalyFlag ? 'warning' : 'success', title: log.anomalyFlag ? 'Logged — anomaly detected' : 'Vitals logged & analyzed', message: log.anomalyFlag ? 'Review the AI analysis result.' : 'AI analysis is ready on the right.' });
    }, 3000);
  };

  return (
    <Card className="p-6">
      <SectionTitle icon="activity" title="Log Today's Vitals" />
      <p className="mt-1.5 text-sm text-slate-500">Enter your readings below. AI analysis will run automatically after submission.</p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        {VITAL_FIELDS.map(f => {
          const tone = vals[f.key] !== '' && !errors[f.key] ? f.check(vals[f.key]) : null;
          return (
            <Field key={f.key} label={f.label} hint={!errors[f.key] ? f.range : undefined} error={errors[f.key]} htmlFor={f.key}>
              <div className="relative">
                <Input id={f.key} type="number" step={f.step} inputMode="decimal" placeholder={f.ph} unit={f.unit}
                  value={vals[f.key]} onChange={e => set(f.key, e.target.value)} error={!!errors[f.key]} />
                {tone && tone !== 'slate' && tone !== 'blue' && (
                  <span className={cx('absolute -right-1 -top-1', '')} />
                )}
              </div>
            </Field>
          );
        })}

        <Button type="submit" size="lg" loading={loading} icon={loading ? undefined : 'sparkles'} className="w-full justify-center">
          {loading ? 'Analyzing with Gemini AI…' : 'Submit & Analyze'}
        </Button>
      </form>
    </Card>
  );
}

function LogEntry({ log }) {
  const { actions, toast } = useStore();
  const badges = [
    { v: log.hr, u: '', tone: hrStatus(log.hr), icon: 'heart' },
    { v: log.spo2, u: '%', tone: spo2Status(log.spo2), icon: 'droplet' },
    { v: log.temp, u: '°', tone: tempStatus(log.temp), icon: 'thermometer' },
    { v: (log.steps || 0).toLocaleString(), u: '', tone: 'blue', icon: 'footprints' },
  ];
  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-200 hover:shadow-sm transition">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{fmtDateTime(log.ts)}</span>
          {log.anomalyFlag && <Icon name="alert-triangle" size={15} className="text-amber-500" title="Anomaly flagged" />}
        </div>
        <button onClick={() => { actions.deleteLog(log.id); toast({ tone: 'info', title: 'Log entry deleted' }); }}
          className="opacity-0 group-hover:opacity-100 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition">
          <Icon name="trash-2" size={15} />
        </button>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {badges.map((b, i) => { const t = TONES[b.tone]; return (
          <span key={i} className={cx('inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold', t.bg, t.text)}>
            <Icon name={b.icon} size={12} />{b.v}{b.u}
          </span>
        ); })}
      </div>
      <p className="mt-2.5 text-[13px] leading-snug text-slate-500">{log.summary.slice(0, 80)}{log.summary.length > 80 ? '…' : ''}</p>
    </div>
  );
}

function RecentLogs() {
  const { logs } = useStore();
  return (
    <Card className="p-6 flex flex-col" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
      <SectionTitle icon="clock" title="Recent Logs" sub={`${logs.length} total entries`} />
      {logs.length === 0 ? (
        <EmptyState icon="inbox" title="No logs yet" message="Your submitted readings will appear here." />
      ) : (
        <div className="mt-4 -mr-2 pr-2 space-y-3 overflow-y-auto vw-scroll">
          {logs.slice(0, 10).map(l => <LogEntry key={l.id} log={l} />)}
        </div>
      )}
    </Card>
  );
}

// ---- AI analysis states (right column top card) --------------------------
function AnalyzingCard() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <SectionTitle icon="sparkles" title="AI Analysis" />
        <Badge tone="green" className="bg-brand-light text-brand"><Icon name="zap" size={12} />Gemini</Badge>
      </div>
      <div className="mt-5 flex flex-col items-center justify-center py-6 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-light text-brand mb-4">
          <Icon name="loader-2" size={26} className="vw-spin" />
        </div>
        <p className="text-[15px] font-semibold text-slate-800">Analyzing with Gemini AI…</p>
        <p className="text-sm text-slate-500 mt-1">Reviewing your vitals against healthy ranges</p>
        <div className="mt-5 w-full max-w-xs space-y-2.5">
          <Skeleton className="h-3.5 w-full" /><Skeleton className="h-3.5 w-[88%]" /><Skeleton className="h-3.5 w-[94%]" />
        </div>
      </div>
    </Card>
  );
}

const RESULT_BANNERS = {
  green: { icon: 'check-circle', label: 'All Clear', sub: 'No anomalies detected in your readings.' },
  amber: { icon: 'alert-triangle', label: 'Monitor Closely', sub: 'Some readings warrant continued observation.' },
  red: { icon: 'alert-circle', label: 'Attention Needed', sub: 'Readings outside the normal range — review recommended.' },
};

const AIResultCard = React.forwardRef(function AIResultCard({ log }, ref) {
  const status = log.anomalyFlag ? ((tempStatus(log.temp) === 'red' || hrStatus(log.hr) === 'red' || spo2Status(log.spo2) === 'red') ? 'red' : 'amber') : 'green';
  const b = RESULT_BANNERS[status];
  const bt = TONES[status === 'green' ? 'green' : status];
  const recs = buildRecommendations(log);
  return (
    <Card ref={ref} className="p-6 ring-1 ring-brand/15 vw-fade-up">
      <div className="flex items-center justify-between">
        <SectionTitle icon="sparkles" title="AI Analysis Result" />
        <Badge tone="green" className="bg-brand-light text-brand"><Icon name="zap" size={12} />Powered by Gemini</Badge>
      </div>

      <div className={cx('mt-4 flex items-center gap-3 rounded-xl border px-4 py-3', bt.bg, bt.border)}>
        <div className={cx('grid h-10 w-10 place-items-center rounded-lg bg-white', bt.text)}><Icon name={b.icon} size={20} /></div>
        <div><p className={cx('text-[15px] font-bold', bt.text)}>{b.label}</p><p className="text-xs text-slate-500">{b.sub}</p></div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2.5">Recommendations</p>
        <ul className="space-y-2.5">
          {recs.map((r, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[14px] leading-snug text-slate-600">
              <span className={cx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', status === 'green' ? 'bg-brand' : bt.dot)} />
              <span style={{ textWrap: 'pretty' }}>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
        <Icon name="clock" size={13} />Analyzed {fmtDateTime(log.ts)}
      </div>
    </Card>
  );
});

function LogHealthPage() {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const resultRef = React.useRef(null);

  const smoothScrollTo = (el) => {
    const main = el.closest('main');
    if (!main) return;
    const top = el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - 80;
    main.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  };

  const onResult = (log) => {
    setAnalyzing(false);
    setResult(log);
    requestAnimationFrame(() => { if (resultRef.current) smoothScrollTo(resultRef.current); });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 items-start">
      <LogForm onAnalyzing={() => { setAnalyzing(true); setResult(null); }} onResult={onResult} />
      <div className="space-y-5 md:space-y-6">
        {analyzing && <AnalyzingCard />}
        {!analyzing && result && <AIResultCard ref={resultRef} log={result} />}
        <RecentLogs />
      </div>
    </div>
  );
}

window.LogHealthPage = LogHealthPage;
