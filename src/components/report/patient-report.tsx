import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { cx } from '@/lib/utils';
import { fmtDate, fmtDateTime, fmtTime12, MONTHS, WEEK } from '@/lib/dates';
import { TONES, hrStatus, spo2Status, tempStatus, type Tone } from '@/lib/vitals';
import { freqLabel, weekAdherenceStates, weekAdherencePct, medicationAlerts, anomalyReason, type ReminderWithWeek } from '@/lib/medication';
import { MiniSpark } from '@/components/report/mini-spark';
import { StatusPill } from '@/components/report/status-pill';
import { ReportSection } from '@/components/report/report-section';
import { REPORT_METRICS, fmtNum, rangeBounds, inRange, presetLabel, type ReportRange } from '@/components/report/report-metrics';

export interface ReportLog {
  id: string;
  ts: Date | string;
  hr: number;
  spo2: number;
  temp: number;
  steps: number;
  summary: string;
  anomalyFlag: boolean;
}

interface PatientReportProps {
  range: ReportRange;
  logs: ReportLog[];
  reminders: ReminderWithWeek[];
  user: { name: string; email: string };
  caregiverName: string;
  caregiverEmail: string;
}

const KPI_TONE: Record<string, string> = {
  brand: 'text-brand',
  green: 'text-emerald-600',
  amber: 'text-amber-600',
  red: 'text-rose-600',
};

export function PatientReport({ range, logs: allLogs, reminders, user, caregiverName, caregiverEmail }: PatientReportProps) {
  const bounds = rangeBounds(range);
  const logs = allLogs.filter((l) => inRange(l.ts, bounds));
  const rangeName = presetLabel(range, bounds);
  const asc = [...logs].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  const latest = logs[0];

  const stat = (key: 'hr' | 'spo2' | 'temp' | 'steps') => {
    const vals = asc.map((l) => +l[key]).filter((v) => !isNaN(v));
    if (!vals.length) return { avg: null as number | null, min: null as number | null, max: null as number | null, vals: [] as number[] };
    return {
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
      min: Math.min(...vals),
      max: Math.max(...vals),
      vals,
    };
  };

  const anomalies = logs.filter((l) => l.anomalyFlag);
  const adherencePct = weekAdherencePct(reminders);
  const medAlerts = medicationAlerts(reminders).filter((m) => inRange(m.ts, bounds));
  const missedCount = medAlerts.filter((m) => m.type === 'missed').length;
  const period = asc.length ? `${fmtDate(asc[0].ts)} – ${fmtDate(asc[asc.length - 1].ts)}` : rangeName;
  const today = new Date();
  const genDate = `${MONTHS[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

  const events: { ts: string | Date; type: string; desc: string; tone: Tone }[] = [
    ...anomalies.map((l) => ({ ts: l.ts, type: 'Vital anomaly', desc: anomalyReason(l), tone: 'amber' as Tone })),
    ...medAlerts.map((m) => ({ ts: m.ts, type: m.type === 'missed' ? 'Missed dose' : 'Late dose', desc: m.reason.replace(/^.*?—\s*/, ''), tone: 'red' as Tone })),
  ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  const kpis = [
    { label: 'Days Monitored', value: logs.length, tone: 'brand' },
    { label: 'Anomalies Flagged', value: anomalies.length, tone: anomalies.length ? 'amber' : 'green' },
    { label: 'Med Adherence', value: `${adherencePct}%`, tone: adherencePct >= 80 ? 'green' : adherencePct >= 50 ? 'amber' : 'red' },
    { label: 'Missed Doses', value: missedCount, tone: missedCount ? 'red' : 'green' },
    { label: 'Avg Heart Rate', value: `${fmtNum(stat('hr').avg, 0)} BPM`, tone: 'brand' },
    { label: 'Avg SpO₂', value: `${fmtNum(stat('spo2').avg, 0)} %`, tone: 'brand' },
  ];

  return (
    <div className="vw-report-root mx-auto bg-white" style={{ width: 794 }}>
      <div className="px-12 py-10">
        {/* ── Masthead ─────────────────────────────────────────── */}
        <header className="flex items-start justify-between gap-6 border-b-4 border-brand pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white"><Icon name="shield-check" size={22} /></div>
              <span className="text-[22px] font-extrabold tracking-tight text-slate-900">Vital<span className="text-brand">Watch</span></span>
            </div>
            <h1 className="mt-4 text-[28px] font-extrabold leading-none tracking-tight text-slate-900">Comprehensive Health Report</h1>
            <p className="mt-2 text-[14px] text-slate-500">Remote patient monitoring summary · {rangeName}</p>
          </div>
          <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-[12px] leading-relaxed">
            <p className="text-slate-400">Report generated</p>
            <p className="font-bold text-slate-800">{genDate}</p>
            <p className="mt-1.5 text-slate-400">Prepared for</p>
            <p className="font-bold text-slate-800">{caregiverName || 'Care team'}</p>
          </div>
        </header>

        {/* patient identity strip */}
        <div className="vw-report-row mt-5 flex items-center gap-4 rounded-xl bg-brand-tint px-5 py-4">
          <Avatar name={user.name} size={52} />
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-extrabold tracking-tight text-slate-900">{user.name}</p>
            <p className="text-[13px] text-slate-500">{user.email}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[12px] whitespace-nowrap">
            <span className="text-slate-400">Period</span><span className="text-right font-semibold text-slate-800">{period}</span>
            <span className="text-slate-400">Readings</span><span className="text-right font-semibold text-slate-800">{logs.length}</span>
            <span className="text-slate-400">Caregiver email</span><span className="text-right font-semibold text-slate-800">{caregiverEmail || 'Not set'}</span>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <Icon name="file-text" size={30} className="text-slate-300" />
            <p className="mt-3 text-[15px] font-bold text-slate-700">No readings in this period</p>
            <p className="mt-1 text-[13px] text-slate-400">Try selecting a wider date range to include more data.</p>
          </div>
        ) : (
          <>
            {/* ── 1. Snapshot ──────────────────────────────────────── */}
            <ReportSection n="1" title="Executive Snapshot">
              <div className="grid grid-cols-3 gap-3">
                {kpis.map((k, i) => (
                  <div key={i} className="vw-report-row rounded-xl border border-slate-200 px-4 py-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{k.label}</p>
                    <p className={cx('mt-1 text-[24px] font-extrabold tracking-tight tabular-nums', KPI_TONE[k.tone])}>{k.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Icon name="sparkles" size={15} className="text-brand" />
                  <span className="text-[12px] font-bold uppercase tracking-wide text-slate-500">AI Clinical Summary</span>
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-700" style={{ textWrap: 'pretty' }}>{latest?.summary || 'No analysis available.'}</p>
              </div>
            </ReportSection>

            {/* ── 2. Vital signs ───────────────────────────────────── */}
            <ReportSection n="2" title="Vital Signs Overview" sub="Averages across monitoring period">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-3 font-semibold">Metric</th>
                    <th className="py-2 px-2 font-semibold text-right">Latest</th>
                    <th className="py-2 px-2 font-semibold text-right">Average</th>
                    <th className="py-2 px-2 font-semibold text-right">Min</th>
                    <th className="py-2 px-2 font-semibold text-right">Max</th>
                    <th className="py-2 px-2 font-semibold">Normal</th>
                    <th className="py-2 px-2 font-semibold">14-day trend</th>
                    <th className="py-2 pl-2 font-semibold">Latest status</th>
                  </tr>
                </thead>
                <tbody>
                  {REPORT_METRICS.map((m) => {
                    const s = stat(m.key);
                    return (
                      <tr key={m.key} className="vw-report-row border-b border-slate-100 text-[13px]">
                        <td className="py-3 pr-3"><span className="flex items-center gap-2 font-semibold text-slate-800"><span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />{m.label}</span></td>
                        <td className="py-3 px-2 text-right font-bold tabular-nums text-slate-900">{fmtNum(latest?.[m.key], m.dec)}</td>
                        <td className="py-3 px-2 text-right tabular-nums text-slate-600">{fmtNum(s.avg, m.dec)}</td>
                        <td className="py-3 px-2 text-right tabular-nums text-slate-600">{fmtNum(s.min, m.dec)}</td>
                        <td className="py-3 px-2 text-right tabular-nums text-slate-600">{fmtNum(s.max, m.dec)}</td>
                        <td className="py-3 px-2 text-[12px] text-slate-500">{m.normal}</td>
                        <td className="py-3 px-2"><MiniSpark values={s.vals} color={m.color} /></td>
                        <td className="py-3 pl-2"><StatusPill tone={m.status(latest?.[m.key])} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ReportSection>

            {/* ── 3. Medication adherence ──────────────────────────── */}
            <ReportSection n="3" title="Medication Adherence" sub={`${adherencePct}% overall · this week`}>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-3 font-semibold">Medication</th>
                    <th className="py-2 px-2 font-semibold">Schedule</th>
                    {WEEK.map((d) => <th key={d} className="py-2 px-1 text-center font-semibold">{d[0]}</th>)}
                    <th className="py-2 pl-2 font-semibold text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.map((r) => {
                    const adherence = weekAdherenceStates(r);
                    const due = adherence.filter((s) => s === 'taken' || s === 'missed').length;
                    const taken = adherence.filter((s) => s === 'taken').length;
                    const rate = due ? Math.round((taken / due) * 100) : 0;
                    return (
                      <tr key={r.id} className="vw-report-row border-b border-slate-100 text-[13px]">
                        <td className="py-3 pr-3"><span className="font-semibold text-slate-800">{r.name}</span> <span className="text-slate-400">{r.dosage}</span></td>
                        <td className="py-3 px-2 text-[12px] text-slate-500">{freqLabel(r)} · {fmtTime12(r.time)}</td>
                        {adherence.map((s, i) => (
                          <td key={i} className="py-3 px-1 text-center">
                            {s === 'taken' ? <Icon name="check" size={14} className="mx-auto text-emerald-500" strokeWidth={3} />
                              : s === 'missed' ? <Icon name="x" size={14} className="mx-auto text-rose-500" strokeWidth={3} />
                              : s === 'pending' ? <Icon name="clock" size={13} className="mx-auto text-amber-400" />
                              : <span className="text-slate-300">·</span>}
                          </td>
                        ))}
                        <td className="py-3 pl-2 text-right"><span className={cx('font-bold tabular-nums', rate >= 80 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-rose-600')}>{rate}%</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5"><Icon name="check" size={12} className="text-emerald-500" strokeWidth={3} />Taken</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="x" size={12} className="text-rose-500" strokeWidth={3} />Missed (caregiver alerted)</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="clock" size={12} className="text-amber-400" />Pending</span>
                <span className="inline-flex items-center gap-1.5"><span className="text-slate-300">·</span>Not scheduled</span>
              </div>
            </ReportSection>

            {/* ── 4. Clinical event log ────────────────────────────── */}
            <ReportSection n="4" title="Anomaly & Adherence Events" sub={`${events.length} flagged`}>
              {events.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-4 text-[13px] font-medium text-emerald-700"><Icon name="check-circle" size={15} />No anomalies or missed doses recorded this period.</div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  {events.map((e, i) => {
                    const t = TONES[e.tone];
                    return (
                      <div key={i} className={cx('vw-report-row flex items-center gap-3 px-4 py-2.5 text-[13px]', i > 0 && 'border-t border-slate-100')}>
                        <Icon name={e.type.includes('dose') ? 'pill' : 'alert-triangle'} size={15} className={t.text} />
                        <span className={cx('w-28 shrink-0 text-[11px] font-bold uppercase tracking-wide', t.text)}>{e.type}</span>
                        <span className="flex-1 text-slate-700">{e.desc}</span>
                        <span className="shrink-0 text-[12px] text-slate-400">{fmtDateTime(e.ts)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </ReportSection>

            {/* ── 5. Full vitals log ───────────────────────────────── */}
            <ReportSection n="5" title="Complete Vitals Log" sub={`${asc.length} readings`}>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-3 font-semibold">Date &amp; time</th>
                    <th className="py-2 px-2 font-semibold text-right">HR</th>
                    <th className="py-2 px-2 font-semibold text-right">SpO₂</th>
                    <th className="py-2 px-2 font-semibold text-right">Temp</th>
                    <th className="py-2 px-2 font-semibold text-right">Steps</th>
                    <th className="py-2 pl-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...asc].reverse().map((l) => (
                    <tr key={l.id} className="vw-report-row border-b border-slate-100 text-[13px]">
                      <td className="py-2.5 pr-3 text-slate-700">{fmtDateTime(l.ts)}</td>
                      <td className={cx('py-2.5 px-2 text-right font-semibold tabular-nums', TONES[hrStatus(l.hr)].text)}>{l.hr}</td>
                      <td className={cx('py-2.5 px-2 text-right font-semibold tabular-nums', TONES[spo2Status(l.spo2)].text)}>{l.spo2}%</td>
                      <td className={cx('py-2.5 px-2 text-right font-semibold tabular-nums', TONES[tempStatus(l.temp)].text)}>{l.temp}°</td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-slate-600">{(l.steps || 0).toLocaleString()}</td>
                      <td className="py-2.5 pl-2">{l.anomalyFlag ? <StatusPill tone="amber" /> : <StatusPill tone="green" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ReportSection>
          </>
        )}

        {/* ── Footer / disclaimer ──────────────────────────────── */}
        <footer className="vw-report-row mt-8 border-t border-slate-200 pt-5 text-[11px] leading-relaxed text-slate-400">
          <p className="font-semibold text-slate-500">Clinical disclaimer</p>
          <p className="mt-1" style={{ textWrap: 'pretty' }}>
            This report is generated from self-reported and device-captured readings for informational purposes only and does not constitute medical advice or a diagnosis.
            AI-generated summaries are assistive and should be reviewed by a qualified clinician. For any urgent or worsening symptoms, contact a healthcare professional immediately.
          </p>
          <p className="mt-3 text-slate-300">VitalWatch · Generated {genDate} · {user.name} · Confidential — share only with authorized care providers.</p>
        </footer>
      </div>
    </div>
  );
}
