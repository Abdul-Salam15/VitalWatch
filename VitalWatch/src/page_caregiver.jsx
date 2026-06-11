// ── Page: Caregiver View ───────────────────────────────────────────────────
function AccessCard() {
  const { settings, actions, toast } = useStore();
  const url = `https://vitalwatch.app/caregiver/${settings.accessToken}`;
  const [revoked, setRevoked] = React.useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(url).catch(() => {});
    toast({ title: 'Link copied to clipboard', message: 'Share it with your caregiver or doctor.' });
  };
  const revoke = () => { setRevoked(true); actions.regenToken(); toast({ tone: 'warning', title: 'Access revoked', message: 'A new link has been generated.' }); setTimeout(() => setRevoked(false), 400); };

  return (
    <Card className="p-6">
      <SectionTitle icon="link" title="Your Caregiver Access" />
      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">Share this link with your caregiver or doctor to give them read-only access to your health data.</p>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icon name="link" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input readOnly value={url} className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 h-11 text-sm text-slate-500 font-mono" />
        </div>
        <div className="flex gap-2">
          <Button icon="copy" onClick={copy}>Copy Link</Button>
          <Button variant="destructive-outline" icon="x-circle" onClick={revoke}>Revoke</Button>
        </div>
      </div>

      {!settings.caregiverEmail && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Icon name="alert-triangle" size={18} className="mt-0.5 text-amber-500" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800">No caregiver email registered</p>
            <p className="text-amber-700">Add one in <button onClick={() => navigate('/settings')} className="font-semibold underline underline-offset-2">Settings</button> to receive escalation alerts.</p>
          </div>
        </div>
      )}
    </Card>
  );
}

function CaregiverPreview() {
  const { logs, user, settings, reminders } = useStore();
  const alerts = caregiverAlerts(logs, reminders);
  const [mail, setMail] = React.useState(null);
  const medCount = alerts.filter(a => a.kind === 'med').length;

  return (
    <Card className="overflow-hidden">
      {/* read-only banner */}
      <div className="flex items-center gap-2 bg-slate-900 px-6 py-3 text-white">
        <Icon name="eye" size={16} />
        <span className="text-sm font-semibold">Caregiver View — Read Only</span>
        <span className="ml-auto text-xs text-slate-300 font-mono">{settings.caregiverName}</span>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size={48} />
            <div>
              <p className="text-lg font-bold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-400">Last active {logs[0] ? relTime(logs[0].ts) : '—'}</p>
            </div>
          </div>
          <Badge tone="green" dot>Monitoring</Badge>
        </div>

        <div className="pointer-events-none select-none"><StatGrid logs={logs} readOnly /></div>

        <div className="pointer-events-none"><CaregiverMeds /></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="pointer-events-none"><AISummaryCard /></div>
            <Card className="p-6">
              <SectionTitle icon="alert-triangle" title="Anomaly & Adherence Alerts" sub={`${alerts.length} flagged · ${medCount} medication`} />
              <div className="mt-4 space-y-2.5">
                {alerts.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400 py-4"><Icon name="check-circle" size={16} className="text-emerald-500" />No anomalies in recent history</div>
                ) : alerts.map(a => {
                  const isMed = a.kind === 'med';
                  return (
                    <div key={a.id} className={cx('flex items-start gap-3 rounded-xl border px-3.5 py-2.5', isMed ? 'border-rose-100 bg-rose-50/50' : 'border-amber-100 bg-amber-50/50')}>
                      <Icon name={isMed ? 'pill' : 'alert-triangle'} size={16} className={cx('mt-0.5 shrink-0', isMed ? 'text-rose-500' : 'text-amber-500')} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-700">{a.reason}</p>
                        {isMed && (
                          <button onClick={() => setMail({ name: a.name, dosage: a.dosage, time: a.time, escalation: a.escalation })}
                            className="mt-0.5 inline-flex items-center gap-1 text-[12px] font-semibold text-rose-600 hover:underline underline-offset-2">
                            <Icon name="mail-check" size={12} />Caregiver emailed · view
                          </button>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-slate-400 whitespace-nowrap">{fmtDate(a.ts)}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
        </div>
      </div>
      <EmailPreviewModal open={!!mail} onClose={() => setMail(null)} kind="caregiver" dose={mail} />
    </Card>
  );
}

function CaregiverMedCard({ r }) {
  const st = doseState(r);
  const due = r.adherence.filter(s => s === 'taken' || s === 'missed').length;
  const taken = r.adherence.filter(s => s === 'taken').length;
  const rate = due ? Math.round((taken / due) * 100) : 0;

  // today's status chip
  const todayMeta = {
    taken: { tone: 'green', icon: 'check-circle', label: 'Taken today' },
    upcoming: { tone: 'slate', icon: 'clock', label: `Due ${fmtTime12(r.time)}` },
    late: { tone: 'amber', icon: 'bell', label: 'Overdue today' },
    escalated: { tone: 'red', icon: 'alert-triangle', label: 'Not taken on time' },
    none: { tone: 'slate', icon: 'minus', label: 'Not scheduled today' },
  }[st.status] || { tone: 'slate', icon: 'minus', label: '—' };
  const tt = TONES[todayMeta.tone];

  return (
    <div className={cx('rounded-xl border p-4', !r.active && 'opacity-70', st.status === 'escalated' ? 'border-rose-200' : 'border-slate-200')}>
      <div className="flex items-start gap-3.5">
        <div className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-xl', r.active ? 'bg-brand-light text-brand' : 'bg-slate-100 text-slate-400')}>
          <Icon name="pill" size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-[16px] font-bold text-slate-900">{r.name}</h4>
            <Badge tone={r.active ? 'green' : 'slate'}>{freqLabel(r)}</Badge>
          </div>
          <p className="mt-0.5 text-[13px] text-slate-500">{r.dosage} · <Icon name="clock" size={12} className="inline -mt-0.5 text-slate-400" /> {fmtTime12(r.time)}</p>
        </div>
        <span className={cx('inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold', tt.bg, tt.text)}>
          <Icon name={todayMeta.icon} size={12} strokeWidth={2.5} />{todayMeta.label}
        </span>
      </div>

      <div className="mt-3.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">This week's intake</span>
          <span className={cx('text-[12px] font-bold tabular-nums', rate >= 80 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-rose-600')}>{rate}% taken</span>
        </div>
        <div className="flex gap-1.5">
          {WEEK.map((d, i) => {
            const a = ADH[r.adherence[i]] || ADH.none;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1" title={`${d}: ${a.label}`}>
                <span className={cx('grid h-7 w-7 max-w-full place-items-center rounded-full', a.cls)}><Icon name={a.icon} size={12} strokeWidth={2.5} /></span>
                <span className="text-[10px] font-medium text-slate-400">{d[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CaregiverMeds() {
  const { reminders } = useStore();
  const active = reminders.filter(r => r.active);
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionTitle icon="pill" title="Medications" sub={`${active.length} active · schedule, intake & status`} />
        <span className="text-sm font-semibold text-slate-500">Overall adherence <span className="text-brand font-extrabold">{weekAdherence(reminders)}%</span></span>
      </div>
      {reminders.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500"><Icon name="pill" size={16} className="text-slate-400" />No medications on file.</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
          {reminders.map(r => <CaregiverMedCard key={r.id} r={r} />)}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
        {[['taken', 'Taken'], ['missed', 'Missed'], ['pending', 'Pending'], ['none', 'No dose']].map(([k, l]) => (
          <span key={k} className="inline-flex items-center gap-1.5"><span className={cx('h-2.5 w-2.5 rounded-sm', ADH[k].cls.split(' ')[0])} />{l}</span>
        ))}
      </div>
    </Card>
  );
}

function CaregiverPage() {
  return (
    <div className="space-y-5 md:space-y-6">
      <AccessCard />
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icon name="eye" size={18} className="text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">Caregiver Dashboard Preview</h3>
          <span className="text-sm text-slate-400">— exactly what your caregiver sees</span>
        </div>
        <CaregiverPreview />
      </div>
    </div>
  );
}

window.CaregiverPage = CaregiverPage;
