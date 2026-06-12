// ── Server-rendered PDF version of the patient health report ──────────────
// Used to attach a downloadable PDF to the caregiver report email.
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { fmtDate, fmtDateTime, fmtTime12, WEEK } from '@/lib/dates';
import { hrStatus, spo2Status, tempStatus, type Tone } from '@/lib/vitals';
import { freqLabel, weekAdherenceStates, weekAdherencePct, medicationAlerts, anomalyReason, type ReminderWithWeek } from '@/lib/medication';
import { REPORT_METRICS, fmtNum, rangeBounds, inRange, presetLabel, type ReportRange } from '@/components/report/report-metrics';

export interface PdfLog {
  id: string;
  ts: Date | string;
  hr: number;
  spo2: number;
  temp: number;
  steps: number;
  summary: string;
  anomalyFlag: boolean;
}

interface PatientReportPdfProps {
  range: ReportRange;
  logs: PdfLog[];
  reminders: ReminderWithWeek[];
  user: { name: string; email: string };
  caregiverName: string;
}

const TONE_COLORS: Record<Tone, string> = {
  green: '#059669',
  amber: '#D97706',
  red: '#E11D48',
  blue: '#0284C7',
  slate: '#64748B',
};

const BRAND = '#1A6B3C';

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: 'Helvetica', color: '#1E293B' },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  brandText: { fontSize: 14, fontWeight: 700, color: '#0F172A' },
  brandAccent: { color: BRAND },
  title: { fontSize: 18, fontWeight: 700, color: '#0F172A', marginTop: 6 },
  subtitle: { fontSize: 9, color: '#64748B', marginTop: 3, marginBottom: 10 },
  divider: { borderBottomWidth: 2, borderBottomColor: BRAND, marginBottom: 10 },
  patientRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F0FAF3', borderRadius: 6, padding: 10, marginBottom: 12 },
  patientName: { fontSize: 12, fontWeight: 700, color: '#0F172A' },
  patientEmail: { fontSize: 9, color: '#64748B', marginTop: 1 },
  metaLabel: { color: '#94A3B8' },
  metaValue: { fontWeight: 700, color: '#0F172A' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 2, minWidth: 160 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: '#0F172A', marginBottom: 2 },
  sectionSub: { fontSize: 8.5, color: '#94A3B8', marginBottom: 6 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  kpiBox: { width: '32%', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, padding: 8, marginBottom: 6 },
  kpiLabel: { fontSize: 7.5, color: '#94A3B8', textTransform: 'uppercase' },
  kpiValue: { fontSize: 15, fontWeight: 700, marginTop: 2 },
  summaryBox: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, backgroundColor: '#F8FAFC', padding: 8, marginTop: 4 },
  summaryLabel: { fontSize: 8, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 3 },
  summaryText: { fontSize: 9, lineHeight: 1.4, color: '#334155' },
  table: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4 },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  trLast: { flexDirection: 'row' },
  thead: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  th: { padding: 5, fontSize: 7.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' },
  td: { padding: 5, fontSize: 9, color: '#334155' },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },
  bold: { fontWeight: 700 },
  muted: { color: '#94A3B8', fontSize: 8 },
  eventRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingVertical: 5, gap: 6 },
  eventType: { width: 90, fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase' },
  eventDesc: { flex: 1, fontSize: 9, color: '#334155' },
  eventTs: { fontSize: 8, color: '#94A3B8' },
  emptyBox: { borderRadius: 6, backgroundColor: '#ECFDF5', padding: 8, color: '#047857', fontSize: 9 },
  footer: { marginTop: 14, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 8 },
  footerTitle: { fontSize: 8, fontWeight: 700, color: '#64748B' },
  footerText: { fontSize: 7.5, color: '#94A3B8', lineHeight: 1.4, marginTop: 3 },
  footerMeta: { fontSize: 7.5, color: '#CBD5E1', marginTop: 6 },
});

export function PatientReportPdf({ range, logs: allLogs, reminders, user, caregiverName }: PatientReportPdfProps) {
  const bounds = rangeBounds(range);
  const logs = allLogs.filter((l) => inRange(l.ts, bounds));
  const rangeName = presetLabel(range, bounds);
  const asc = [...logs].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  const latest = logs[0];

  const stat = (key: 'hr' | 'spo2' | 'temp' | 'steps') => {
    const vals = asc.map((l) => +l[key]).filter((v) => !isNaN(v));
    if (!vals.length) return { avg: null as number | null, min: null as number | null, max: null as number | null };
    return { avg: vals.reduce((a, b) => a + b, 0) / vals.length, min: Math.min(...vals), max: Math.max(...vals) };
  };

  const anomalies = logs.filter((l) => l.anomalyFlag);
  const adherencePct = weekAdherencePct(reminders);
  const medAlerts = medicationAlerts(reminders).filter((m) => inRange(m.ts, bounds));
  const missedCount = medAlerts.filter((m) => m.type === 'missed').length;
  const period = asc.length ? `${fmtDate(asc[0].ts)} – ${fmtDate(asc[asc.length - 1].ts)}` : rangeName;
  const genDate = fmtDateTime(new Date());

  const events = [
    ...anomalies.map((l) => ({ ts: l.ts, type: 'Vital anomaly', desc: anomalyReason(l), tone: 'amber' as Tone })),
    ...medAlerts.map((m) => ({ ts: m.ts, type: m.type === 'missed' ? 'Missed dose' : 'Late dose', desc: m.reason.replace(/^.*?—\s*/, ''), tone: 'red' as Tone })),
  ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  const kpis: { label: string; value: string | number; color: string }[] = [
    { label: 'Days Monitored', value: logs.length, color: BRAND },
    { label: 'Anomalies Flagged', value: anomalies.length, color: anomalies.length ? TONE_COLORS.amber : TONE_COLORS.green },
    { label: 'Med Adherence', value: `${adherencePct}%`, color: adherencePct >= 80 ? TONE_COLORS.green : adherencePct >= 50 ? TONE_COLORS.amber : TONE_COLORS.red },
    { label: 'Missed Doses', value: missedCount, color: missedCount ? TONE_COLORS.red : TONE_COLORS.green },
    { label: 'Avg Heart Rate', value: `${fmtNum(stat('hr').avg, 0)} BPM`, color: BRAND },
    { label: 'Avg SpO₂', value: `${fmtNum(stat('spo2').avg, 0)} %`, color: BRAND },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          <Text style={styles.brandText}>Vital<Text style={styles.brandAccent}>Watch</Text></Text>
        </View>
        <Text style={styles.title}>Comprehensive Health Report</Text>
        <Text style={styles.subtitle}>Remote patient monitoring summary · {rangeName} · Generated {genDate}</Text>
        <View style={styles.divider} />

        <View style={styles.patientRow}>
          <View>
            <Text style={styles.patientName}>{user.name}</Text>
            <Text style={styles.patientEmail}>{user.email}</Text>
          </View>
          <View>
            <View style={styles.metaRow}><Text style={styles.metaLabel}>Period</Text><Text style={styles.metaValue}>{period}</Text></View>
            <View style={styles.metaRow}><Text style={styles.metaLabel}>Readings</Text><Text style={styles.metaValue}>{logs.length}</Text></View>
            <View style={styles.metaRow}><Text style={styles.metaLabel}>Prepared for</Text><Text style={styles.metaValue}>{caregiverName || 'Care team'}</Text></View>
          </View>
        </View>

        {logs.length === 0 ? (
          <View style={styles.emptyBox}><Text>No readings in this period.</Text></View>
        ) : (
          <>
            {/* 1. Executive snapshot */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Executive Snapshot</Text>
              <View style={styles.kpiGrid}>
                {kpis.map((k, i) => (
                  <View key={i} style={styles.kpiBox}>
                    <Text style={styles.kpiLabel}>{k.label}</Text>
                    <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>AI Clinical Summary</Text>
                <Text style={styles.summaryText}>{latest?.summary || 'No analysis available.'}</Text>
              </View>
            </View>

            {/* 2. Vital signs overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Vital Signs Overview</Text>
              <Text style={styles.sectionSub}>Averages across monitoring period</Text>
              <View style={styles.table}>
                <View style={styles.thead}>
                  <Text style={[styles.th, { flex: 2.4 }]}>Metric</Text>
                  <Text style={[styles.th, styles.right, { flex: 1 }]}>Latest</Text>
                  <Text style={[styles.th, styles.right, { flex: 1 }]}>Average</Text>
                  <Text style={[styles.th, styles.right, { flex: 1 }]}>Min</Text>
                  <Text style={[styles.th, styles.right, { flex: 1 }]}>Max</Text>
                  <Text style={[styles.th, { flex: 1.8 }]}>Normal</Text>
                </View>
                {REPORT_METRICS.map((m, i) => {
                  const s = stat(m.key);
                  const last = REPORT_METRICS.length - 1 === i;
                  return (
                    <View key={m.key} style={last ? styles.trLast : styles.tr}>
                      <Text style={[styles.td, styles.bold, { flex: 2.4 }]}>{m.label}</Text>
                      <Text style={[styles.td, styles.right, { flex: 1, color: TONE_COLORS[m.status(latest?.[m.key])] }]}>{fmtNum(latest?.[m.key], m.dec)}</Text>
                      <Text style={[styles.td, styles.right, { flex: 1 }]}>{fmtNum(s.avg, m.dec)}</Text>
                      <Text style={[styles.td, styles.right, { flex: 1 }]}>{fmtNum(s.min, m.dec)}</Text>
                      <Text style={[styles.td, styles.right, { flex: 1 }]}>{fmtNum(s.max, m.dec)}</Text>
                      <Text style={[styles.td, styles.muted, { flex: 1.8 }]}>{m.normal}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 3. Medication adherence */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Medication Adherence</Text>
              <Text style={styles.sectionSub}>{adherencePct}% overall · this week</Text>
              {reminders.length === 0 ? (
                <View style={styles.emptyBox}><Text>No medications configured.</Text></View>
              ) : (
                <View style={styles.table}>
                  <View style={styles.thead}>
                    <Text style={[styles.th, { flex: 2.6 }]}>Medication</Text>
                    <Text style={[styles.th, { flex: 1.8 }]}>Schedule</Text>
                    {WEEK.map((d) => <Text key={d} style={[styles.th, styles.center, { flex: 0.6 }]}>{d[0]}</Text>)}
                    <Text style={[styles.th, styles.right, { flex: 0.8 }]}>Rate</Text>
                  </View>
                  {reminders.map((r, i) => {
                    const adherence = weekAdherenceStates(r);
                    const due = adherence.filter((s) => s === 'taken' || s === 'missed').length;
                    const taken = adherence.filter((s) => s === 'taken').length;
                    const rate = due ? Math.round((taken / due) * 100) : 0;
                    const last = reminders.length - 1 === i;
                    return (
                      <View key={r.id} style={last ? styles.trLast : styles.tr}>
                        <Text style={[styles.td, { flex: 2.6 }]}><Text style={styles.bold}>{r.name}</Text> {r.dosage}</Text>
                        <Text style={[styles.td, styles.muted, { flex: 1.8 }]}>{freqLabel(r)} · {fmtTime12(r.time)}</Text>
                        {adherence.map((s, j) => (
                          <Text key={j} style={[styles.td, styles.center, { flex: 0.6, color: s === 'taken' ? TONE_COLORS.green : s === 'missed' ? TONE_COLORS.red : '#94A3B8' }]}>
                            {s === 'taken' ? '✓' : s === 'missed' ? '✕' : s === 'pending' ? '•' : '–'}
                          </Text>
                        ))}
                        <Text style={[styles.td, styles.right, styles.bold, { flex: 0.8, color: rate >= 80 ? TONE_COLORS.green : rate >= 50 ? TONE_COLORS.amber : TONE_COLORS.red }]}>{rate}%</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* 4. Anomaly & adherence events */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Anomaly &amp; Adherence Events</Text>
              <Text style={styles.sectionSub}>{events.length} flagged</Text>
              {events.length === 0 ? (
                <View style={styles.emptyBox}><Text>No anomalies or missed doses recorded this period.</Text></View>
              ) : (
                <View>
                  {events.map((e, i) => (
                    <View key={i} style={styles.eventRow}>
                      <Text style={[styles.eventType, { color: TONE_COLORS[e.tone] }]}>{e.type}</Text>
                      <Text style={styles.eventDesc}>{e.desc}</Text>
                      <Text style={styles.eventTs}>{fmtDateTime(e.ts)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 5. Full vitals log */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Complete Vitals Log</Text>
              <Text style={styles.sectionSub}>{asc.length} readings</Text>
              <View style={styles.table}>
                <View style={styles.thead}>
                  <Text style={[styles.th, { flex: 2.2 }]}>Date &amp; time</Text>
                  <Text style={[styles.th, styles.right, { flex: 1 }]}>HR</Text>
                  <Text style={[styles.th, styles.right, { flex: 1 }]}>SpO₂</Text>
                  <Text style={[styles.th, styles.right, { flex: 1 }]}>Temp</Text>
                  <Text style={[styles.th, styles.right, { flex: 1 }]}>Steps</Text>
                  <Text style={[styles.th, { flex: 1.2 }]}>Status</Text>
                </View>
                {[...asc].reverse().map((l, i) => {
                  const last = asc.length - 1 === i;
                  return (
                    <View key={l.id} style={last ? styles.trLast : styles.tr} wrap={false}>
                      <Text style={[styles.td, { flex: 2.2 }]}>{fmtDateTime(l.ts)}</Text>
                      <Text style={[styles.td, styles.right, { flex: 1, color: TONE_COLORS[hrStatus(l.hr)] }]}>{l.hr}</Text>
                      <Text style={[styles.td, styles.right, { flex: 1, color: TONE_COLORS[spo2Status(l.spo2)] }]}>{l.spo2}%</Text>
                      <Text style={[styles.td, styles.right, { flex: 1, color: TONE_COLORS[tempStatus(l.temp)] }]}>{l.temp}°</Text>
                      <Text style={[styles.td, styles.right, { flex: 1 }]}>{(l.steps || 0).toLocaleString()}</Text>
                      <Text style={[styles.td, { flex: 1.2, color: l.anomalyFlag ? TONE_COLORS.amber : TONE_COLORS.green }]}>{l.anomalyFlag ? 'Flagged' : 'Normal'}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Clinical disclaimer</Text>
          <Text style={styles.footerText}>
            This report is generated from self-reported and device-captured readings for informational purposes only and does not constitute medical advice or a diagnosis.
            AI-generated summaries are assistive and should be reviewed by a qualified clinician. For any urgent or worsening symptoms, contact a healthcare professional immediately.
          </Text>
          <Text style={styles.footerMeta}>VitalWatch · Generated {genDate} · {user.name} · Confidential — share only with authorized care providers.</Text>
        </View>
      </Page>
    </Document>
  );
}

export default PatientReportPdf;
