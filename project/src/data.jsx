// ── VitalWatch data layer: mock data, status helpers, store, toasts ────────

// ---- Status thresholds ----------------------------------------------------
function hrStatus(v) {
  if (v == null || v === '') return 'slate';
  v = +v;
  if (v >= 60 && v <= 100) return 'green';
  if ((v >= 50 && v < 60) || (v > 100 && v <= 110)) return 'amber';
  return 'red';
}
function spo2Status(v) {
  if (v == null || v === '') return 'slate';
  v = +v;
  if (v >= 95) return 'green';
  if (v >= 90) return 'amber';
  return 'red';
}
function tempStatus(v) {
  if (v == null || v === '') return 'slate';
  v = +v;
  if (v >= 36 && v <= 37.5) return 'green';
  if (v > 37.5 && v <= 38.5) return 'amber';
  return 'red';
}
function stepsStatus() { return 'blue'; }

// Tone → Tailwind class bundle
const TONES = {
  green: { text: 'text-emerald-700', bg: 'bg-emerald-50', soft: 'bg-emerald-100', icon: 'text-emerald-600', dot: 'bg-emerald-500', border: 'border-emerald-200', ring: 'ring-emerald-500', label: 'Normal' },
  amber: { text: 'text-amber-700', bg: 'bg-amber-50', soft: 'bg-amber-100', icon: 'text-amber-500', dot: 'bg-amber-500', border: 'border-amber-200', ring: 'ring-amber-500', label: 'Borderline' },
  red: { text: 'text-rose-700', bg: 'bg-rose-50', soft: 'bg-rose-100', icon: 'text-rose-500', dot: 'bg-rose-500', border: 'border-rose-200', ring: 'ring-rose-500', label: 'Abnormal' },
  blue: { text: 'text-sky-700', bg: 'bg-sky-50', soft: 'bg-sky-100', icon: 'text-sky-500', dot: 'bg-sky-500', border: 'border-sky-200', ring: 'ring-sky-500', label: 'Tracking' },
  slate: { text: 'text-slate-600', bg: 'bg-slate-50', soft: 'bg-slate-100', icon: 'text-slate-400', dot: 'bg-slate-400', border: 'border-slate-200', ring: 'ring-slate-400', label: '—' },
};

// ---- Date helpers ---------------------------------------------------------
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(d) { d = new Date(d); return `${MONTHS[d.getMonth()]} ${d.getDate()}`; }
function fmtDateTime(d) {
  d = new Date(d);
  let h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${h}:${m} ${ap}`;
}
function fmtTime12(hhmm) {
  if (!hhmm) return '';
  let [h, m] = hhmm.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}
// Human duration: < 60 → "30 min"; otherwise "1 hr" / "1 hr 20 min"
function fmtDuration(mins) {
  let m = Math.max(0, Math.round(+mins || 0));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), rem = m % 60;
  return rem ? `${h} hr ${rem} min` : `${h} hr`;
}
function relTime(d) {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ---- Mock data builders ---------------------------------------------------
const SUMMARIES = [
  { text: 'Your vitals are within healthy ranges. Heart rate has been stable over the past week. SpO2 is excellent at 97%. Consider increasing daily steps toward an 8,000 goal. No concerning patterns detected.', flag: false },
  { text: 'All readings look healthy today. Resting heart rate is steady and oxygen saturation is strong. Your activity dipped slightly versus yesterday — a short evening walk would help close the gap.', flag: false },
  { text: 'Temperature is marginally elevated at 37.6°C, which can be normal after activity. Continue monitoring and hydrate well. Other vitals remain in normal ranges with no signs of strain.', flag: true },
  { text: 'Excellent metrics across the board. Heart rate, oxygen, and temperature are all in optimal ranges, and step count is trending upward week over week. Keep up the consistent routine.', flag: false },
];

function buildLogs() {
  const out = [];
  const base = { hr: 74, spo2: 97, temp: 36.8, steps: 6240 };
  for (let i = 13; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(8 + (i % 3), 15 + (i % 30), 0, 0);
    const wobble = (n, amp) => Math.round((n + (Math.sin(i * 1.7) * amp)) * 10) / 10;
    const hr = Math.round(base.hr + Math.sin(i * 0.9) * 6 + (i === 4 ? 30 : 0));
    const spo2 = Math.min(99, Math.round(base.spo2 + Math.cos(i * 0.6) * 1.4));
    const temp = i === 2 ? 37.6 : wobble(base.temp, 0.35);
    const steps = Math.max(1200, Math.round(base.steps + Math.sin(i * 0.5) * 2600 + (i === 0 ? 0 : (13 - i) * 120)));
    const s = SUMMARIES[i % SUMMARIES.length];
    const anomaly = i === 2 || i === 4;
    out.push({
      id: 'log-' + day.getTime(),
      ts: day.toISOString(),
      hr, spo2, temp: Math.round(temp * 10) / 10, steps,
      summary: anomaly ? SUMMARIES[2].text : s.text,
      anomalyFlag: anomaly,
    });
  }
  // newest first for the list; chart re-sorts ascending
  return out.reverse();
}

function buildReminders() {
  // adherence: index 0=Mon … 6=Sun ; 'taken' | 'missed' | 'pending' | 'none'
  return [
    { id: 'rem-1', name: 'Metformin', dosage: '500 mg', time: '08:00', frequency: 'Daily', customDays: [], escalation: 30, active: true,
      adherence: ['taken', 'taken', 'taken', 'missed', 'taken', 'taken', 'pending'] },
    { id: 'rem-2', name: 'Lisinopril', dosage: '10 mg', time: '20:00', frequency: 'Daily', customDays: [], escalation: 45, active: true,
      adherence: ['taken', 'taken', 'missed', 'taken', 'taken', 'missed', 'pending'] },
    { id: 'rem-3', name: 'Vitamin D3', dosage: '1 tablet', time: '13:00', frequency: 'Weekdays', customDays: [], escalation: 30, active: true,
      adherence: ['taken', 'taken', 'taken', 'taken', 'taken', 'none', 'none'] },
  ];
}

function freqLabel(r) {
  if (r.frequency === 'Custom' && r.customDays?.length) {
    return r.customDays.map(i => WEEK[i].slice(0, 3)).join('/');
  }
  return r.frequency;
}

// week-wide adherence percentage across all active reminders
function weekAdherence(reminders) {
  let taken = 0, due = 0;
  reminders.filter(r => r.active).forEach(r => r.adherence.forEach(s => {
    if (s === 'taken') { taken++; due++; }
    else if (s === 'missed') { due++; }
  }));
  return due === 0 ? 0 : Math.round((taken / due) * 100);
}
// collapse all reminders to a single 7-day status row for the dashboard
function combinedWeek(reminders) {
  return WEEK.map((_, i) => {
    const states = reminders.filter(r => r.active).map(r => r.adherence[i]);
    if (states.every(s => s === 'none' || s === undefined)) return 'none';
    if (states.includes('missed')) return 'missed';
    if (states.includes('pending')) return 'pending';
    return 'taken';
  });
}

// ---- Anomaly alerts (derived) --------------------------------------------
function anomalyReason(l) {
  if (tempStatus(l.temp) !== 'green') return `Elevated temperature (${l.temp}°C)`;
  if (hrStatus(l.hr) !== 'green') return `Irregular heart rate (${l.hr} BPM)`;
  if (spo2Status(l.spo2) !== 'green') return `Low oxygen saturation (${l.spo2}%)`;
  return 'Vitals flagged for review';
}
function anomalyAlerts(logs) {
  return logs.filter(l => l.anomalyFlag).slice(0, 6).map(l => ({ id: l.id, ts: l.ts, reason: anomalyReason(l) }));
}

// Timestamp for a weekday index (Mon=0) within the current week
function weekdayTs(i) {
  const d = new Date();
  const jsDay = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - (jsDay - i));
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

// ---- Medication: today's dose state, due/late/escalated -------------------
// today's weekday index (Mon=0 … Sun=6)
function todayIdx() { return (new Date().getDay() + 6) % 7; }
function minsNow() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
function reminderMins(r) { const [h, m] = (r.time || '00:00').split(':').map(Number); return h * 60 + m; }
// ISO timestamp for today at a given minute-of-day
function todayTsAt(min) { const d = new Date(); d.setHours(Math.floor(min / 60), min % 60, 0, 0); return d.toISOString(); }

function isDueToday(r) {
  if (!r.active) return false;
  const i = todayIdx();
  if (r.frequency === 'Weekdays') return i <= 4;
  if (r.frequency === 'Weekends') return i >= 5;
  if (r.frequency === 'Custom') return !!r.customDays?.includes(i);
  return true; // Daily
}

// Runtime state of TODAY's dose for a reminder.
//  taken | escalated (past grace → caregiver notified) | late (past time → patient reminded) | upcoming | none
function doseState(r) {
  const i = todayIdx();
  if (r.adherence[i] === 'taken') return { status: 'taken' };
  if (!isDueToday(r)) return { status: 'none' };
  const now = minsNow(), sch = reminderMins(r), grace = +r.escalation || 30;
  if (now >= sch + grace) return { status: 'escalated', late: true, escalated: true, scheduled: sch, overdueMin: now - sch };
  if (now >= sch) return { status: 'late', late: true, escalated: false, scheduled: sch, overdueMin: now - sch };
  return { status: 'upcoming', scheduled: sch };
}

// All medication "not on time" events: historical missed + today's late/escalated.
// escalated=true means the caregiver has been (or will be) emailed per the escalation delay.
function medicationAlerts(reminders) {
  const out = [];
  reminders.filter(r => r.active).forEach(r => {
    r.adherence.forEach((s, i) => {
      if (i < todayIdx() && s === 'missed') out.push({
        id: `mm-${r.id}-${i}`, type: 'missed', escalated: true,
        name: r.name, dosage: r.dosage, time: r.time, escalation: r.escalation,
        reason: `Missed dose — ${r.name} ${r.dosage}`,
        detail: `Scheduled ${fmtTime12(r.time)} · caregiver alerted`,
        ts: weekdayTs(i),
      });
    });
    const st = doseState(r);
    if (st.status === 'escalated') out.push({
      id: `me-${r.id}`, type: 'late', escalated: true,
      name: r.name, dosage: r.dosage, time: r.time, escalation: r.escalation, overdueMin: st.overdueMin,
      reason: `Dose not taken on time — ${r.name} ${r.dosage}`,
      detail: `Scheduled ${fmtTime12(r.time)} · ${fmtDuration(st.overdueMin)} overdue`,
      ts: todayTsAt(st.scheduled),
    });
    else if (st.status === 'late') out.push({
      id: `ml-${r.id}`, type: 'late', escalated: false,
      name: r.name, dosage: r.dosage, time: r.time, escalation: r.escalation, overdueMin: st.overdueMin,
      reason: `Dose overdue — ${r.name} ${r.dosage}`,
      detail: `Scheduled ${fmtTime12(r.time)} · reminder sent to patient`,
      ts: todayTsAt(st.scheduled),
    });
  });
  return out;
}

// Caregiver-facing alert feed: vital anomalies + escalated medication events.
function caregiverAlerts(logs, reminders) {
  const vitals = anomalyAlerts(logs).map(a => ({ ...a, kind: 'vital', emailed: false }));
  const meds = medicationAlerts(reminders).filter(m => m.escalated).map(m => ({
    id: m.id, ts: m.ts, reason: m.reason, detail: m.detail, kind: 'med', emailed: true,
    name: m.name, dosage: m.dosage, time: m.time, escalation: m.escalation,
  }));
  return [...vitals, ...meds].sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 8);
}

// Today's doses that require a patient reminder (overdue, not yet taken).
function patientReminders(reminders) {
  return reminders.filter(r => r.active)
    .map(r => ({ r, st: doseState(r) }))
    .filter(x => x.st.status === 'late' || x.st.status === 'escalated');
}

// Build a unified notification feed: missed doses, anomalies, analysis-complete
function buildNotifications(logs, reminders) {
  const items = [];
  logs.slice(0, 6).forEach(l => {
    if (l.anomalyFlag) items.push({ id: 'an-' + l.id, type: 'anomaly', text: 'Anomaly detected', detail: anomalyReason(l), ts: l.ts });
    else items.push({ id: 'ok-' + l.id, type: 'analysis', text: 'Analysis complete', detail: 'Vitals reviewed — all clear', ts: l.ts });
  });
  reminders.filter(r => r.active).forEach(r => r.adherence.forEach((s, i) => {
    if (i < todayIdx() && s === 'missed') items.push({ id: `md-${r.id}-${i}`, type: 'missed', text: 'Missed dose', detail: `${r.name} ${r.dosage}`, ts: weekdayTs(i) });
  }));
  // today's overdue doses → in-app reminders / escalations
  patientReminders(reminders).forEach(({ r, st }) => {
    items.push({
      id: `rem-today-${r.id}`,
      type: st.escalated ? 'missed' : 'reminder',
      text: st.escalated ? 'Dose overdue — caregiver alerted' : 'Time for your medication',
      detail: `${r.name} ${r.dosage} · ${fmtTime12(r.time)}`,
      ts: todayTsAt(st.scheduled),
    });
  });
  return items.sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 6);
}

const NOTIF_DOT = { missed: 'bg-rose-500', anomaly: 'bg-amber-500', analysis: 'bg-emerald-500', reminder: 'bg-amber-400' };
const NOTIF_ICON = { missed: 'pill', anomaly: 'alert-triangle', analysis: 'check-circle', reminder: 'bell' };

// Recommendations for the AI result card
function buildRecommendations(l) {
  const recs = [];
  if (tempStatus(l.temp) !== 'green') recs.push(`Body temperature is ${l.temp}°C — monitor closely and stay hydrated.`);
  if (spo2Status(l.spo2) !== 'green') recs.push(`Oxygen saturation at ${l.spo2}% is below target — rest and recheck shortly.`);
  if (hrStatus(l.hr) !== 'green') recs.push(`Heart rate of ${l.hr} BPM is outside the normal range — avoid strain.`);
  recs.push(`Heart rate of ${l.hr} BPM and SpO2 of ${l.spo2}% recorded.`);
  if (l.steps < 8000) recs.push(`You logged ${(+l.steps).toLocaleString()} steps — aim for 8,000 with a short walk.`);
  else recs.push(`Great activity — ${(+l.steps).toLocaleString()} steps logged today.`);
  if (!l.anomalyFlag) recs.push('No concerning patterns detected in your latest readings.');
  return recs.slice(0, 4);
}

// ---- Persistent store -----------------------------------------------------
const LS_KEY = 'vitalwatch_state_v1';

function defaultState() {
  return {
    isAuthenticated: true, // mock auth flag
    user: { name: 'Eleanor Hayes', email: 'eleanor.hayes@example.com' },
    logs: buildLogs(),
    reminders: buildReminders(),
    settings: {
      caregiverEmail: '',
      caregiverName: 'Dr. Marcus Reed',
      accessToken: 'a3f9-7c21-e8b4',
      notif: { browser: true, emailSummary: true, caregiverAnomaly: true, medReminderEmail: true, caregiverMissedDose: true },
    },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // merge to tolerate schema additions
      return { ...defaultState(), ...parsed, settings: { ...defaultState().settings, ...(parsed.settings || {}) } };
    }
  } catch (e) {}
  return defaultState();
}

function initials(name) {
  return (name || '').trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'U';
}

const AppContext = React.createContext(null);

function AppProvider({ children }) {
  const [state, setState] = React.useState(loadState);
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);

  const toast = React.useCallback((opts) => {
    const id = 't' + Date.now() + Math.random().toString(16).slice(2, 6);
    const t = typeof opts === 'string' ? { title: opts } : opts;
    setToasts(ts => [...ts, { id, tone: 'success', ...t }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), t.duration || 3600);
  }, []);
  const dismissToast = React.useCallback((id) => setToasts(ts => ts.filter(x => x.id !== id)), []);

  const actions = React.useMemo(() => ({
    addLog(entry) {
      const flag = hrStatus(entry.hr) === 'red' || spo2Status(entry.spo2) !== 'green' || tempStatus(entry.temp) !== 'green';
      const summary = flag
        ? `One or more readings fall outside the optimal range. ${tempStatus(entry.temp) !== 'green' ? `Body temperature of ${entry.temp}°C warrants monitoring. ` : ''}${spo2Status(entry.spo2) !== 'green' ? `Oxygen saturation at ${entry.spo2}% is below target. ` : ''}Continue tracking and contact your provider if symptoms develop.`
        : `Your vitals are within healthy ranges. Heart rate of ${entry.hr} BPM and SpO2 of ${entry.spo2}% look strong. ${entry.steps < 8000 ? `You logged ${(+entry.steps).toLocaleString()} steps — a short walk would help reach your 8,000 goal.` : 'Great activity level today.'} No concerning patterns detected.`;
      const log = {
        id: 'log-' + Date.now(), ts: new Date().toISOString(),
        hr: +entry.hr, spo2: +entry.spo2, temp: +entry.temp, steps: +entry.steps,
        summary, anomalyFlag: flag,
      };
      setState(s => ({ ...s, logs: [log, ...s.logs] }));
      return log;
    },
    deleteLog(id) { setState(s => ({ ...s, logs: s.logs.filter(l => l.id !== id) })); },
    addReminder(r) { setState(s => ({ ...s, reminders: [...s.reminders, { ...r, id: 'rem-' + Date.now(), adherence: ['none','none','none','none','none','none','none'] }] })); },
    updateReminder(id, patch) { setState(s => ({ ...s, reminders: s.reminders.map(r => r.id === id ? { ...r, ...patch } : r) })); },
    deleteReminder(id) { setState(s => ({ ...s, reminders: s.reminders.filter(r => r.id !== id) })); },
    toggleReminder(id) { setState(s => ({ ...s, reminders: s.reminders.map(r => r.id === id ? { ...r, active: !r.active } : r) })); },
    checkInDose(id) { const i = todayIdx(); setState(s => ({ ...s, reminders: s.reminders.map(r => r.id === id ? { ...r, adherence: r.adherence.map((a, idx) => idx === i ? 'taken' : a) } : r) })); },
    undoDose(id) { const i = todayIdx(); setState(s => ({ ...s, reminders: s.reminders.map(r => r.id === id ? { ...r, adherence: r.adherence.map((a, idx) => idx === i ? 'pending' : a) } : r) })); },
    updateSettings(patch) { setState(s => ({ ...s, settings: { ...s.settings, ...patch } })); },
    updateUser(patch) { setState(s => ({ ...s, user: { ...s.user, ...patch } })); },
    resetAll() { setState(defaultState()); },
    setAuth(v) { setState(s => ({ ...s, isAuthenticated: v })); },
    regenToken() { setState(s => ({ ...s, settings: { ...s.settings, accessToken: Math.random().toString(16).slice(2, 6) + '-' + Math.random().toString(16).slice(2, 6) + '-' + Math.random().toString(16).slice(2, 6) } })); },
  }), []);

  const value = { ...state, actions, toast, dismissToast, toasts, initials: initials(state.user.name) };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useStore() { return React.useContext(AppContext); }

Object.assign(window, {
  AppContext, AppProvider, useStore,
  hrStatus, spo2Status, tempStatus, stepsStatus, TONES,
  fmtDate, fmtDateTime, fmtTime12, fmtDuration, relTime, DAYS, WEEK, MONTHS,
  freqLabel, weekAdherence, combinedWeek, anomalyAlerts, anomalyReason, initials,
  buildNotifications, NOTIF_DOT, NOTIF_ICON, buildRecommendations,
  todayIdx, isDueToday, doseState, medicationAlerts, caregiverAlerts, patientReminders,
  minsNow, reminderMins, todayTsAt,
});
