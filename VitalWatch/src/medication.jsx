// ── Medication: daily check-in, in-app reminders, email previews ───────────

// status meta for a today-dose runtime state
const DOSE_META = {
  taken:     { tone: 'green', icon: 'check-circle', label: 'Taken' },
  upcoming:  { tone: 'slate', icon: 'clock', label: 'Upcoming' },
  late:      { tone: 'amber', icon: 'bell', label: 'Overdue' },
  escalated: { tone: 'red', icon: 'alert-triangle', label: 'Not on time' },
};

// ---- Simulated email preview ---------------------------------------------
function EmailChrome({ from, fromAddr, to, subject, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="space-y-2 border-b border-slate-100 bg-slate-50 px-5 py-4">
        <p className="text-[15px] font-bold text-slate-900" style={{ textWrap: 'pretty' }}>{subject}</p>
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-brand text-white"><Icon name="shield-check" size={16} /></div>
          <div className="min-w-0 text-[13px] leading-tight">
            <p className="font-semibold text-slate-800">{from} <span className="font-normal text-slate-400">&lt;{fromAddr}&gt;</span></p>
            <p className="text-slate-500">to {to}</p>
          </div>
        </div>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

function EmailBody({ accent = 'brand', badge, badgeTone = 'green', heading, lead, rows, cta, footnote }) {
  const bt = TONES[badgeTone] || TONES.green;
  return (
    <div>
      <div className={cx('px-6 py-5', accent === 'rose' ? 'bg-rose-600' : 'bg-brand')}>
        <div className="flex items-center gap-2 text-white">
          <Icon name="shield-check" size={18} />
          <span className="text-[15px] font-extrabold tracking-tight">VitalWatch</span>
        </div>
      </div>
      <div className="px-6 py-6">
        {badge && <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', bt.bg, bt.text)}><Icon name={badgeTone === 'red' ? 'alert-triangle' : badgeTone === 'amber' ? 'bell' : 'check-circle'} size={13} />{badge}</span>}
        <h3 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900" style={{ textWrap: 'balance' }}>{heading}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600" style={{ textWrap: 'pretty' }}>{lead}</p>

        {rows && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            {rows.map(([k, v], i) => (
              <div key={i} className={cx('flex items-center justify-between gap-4 px-4 py-2.5 text-sm', i > 0 && 'border-t border-slate-100')}>
                <span className="text-slate-500">{k}</span>
                <span className="font-semibold text-slate-800 text-right">{v}</span>
              </div>
            ))}
          </div>
        )}

        {cta && (
          <div className="mt-5">
            <span className={cx('inline-flex h-11 items-center gap-2 rounded-xl px-5 text-[15px] font-semibold text-white shadow-sm', accent === 'rose' ? 'bg-rose-600' : 'bg-brand')}>
              <Icon name={cta.icon || 'check'} size={16} />{cta.label}
            </span>
          </div>
        )}

        {footnote && <p className="mt-5 border-t border-slate-100 pt-4 text-[13px] leading-relaxed text-slate-400" style={{ textWrap: 'pretty' }}>{footnote}</p>}
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-6 py-3.5 text-[12px] text-slate-400">
        VitalWatch · Remote patient monitoring · This is an automated message.
      </div>
    </div>
  );
}

function EmailPreviewModal({ open, onClose, kind, dose }) {
  const { user, settings } = useStore();
  if (!dose && open) return null;
  const first = (user.name || '').split(' ')[0];
  const caregiverTo = settings.caregiverEmail
    ? `${settings.caregiverName} <${settings.caregiverEmail}>`
    : `${settings.caregiverName} (no email on file)`;
  const overdue = dose?.overdueMin != null ? fmtDuration(dose.overdueMin) : fmtDuration(dose?.escalation || 30);

  const isCaregiver = kind === 'caregiver';
  return (
    <Modal open={open} onClose={onClose} size="lg" icon={isCaregiver ? 'mail-check' : 'mail'}
      title={isCaregiver ? 'Caregiver alert email' : 'Patient reminder email'}
      description={isCaregiver ? 'Automatically sent when a dose is not taken on time.' : 'Sent to the patient when a dose becomes due.'}
      footer={<Button icon="check" onClick={onClose}>Close preview</Button>}>
      {dose && (isCaregiver ? (
        <EmailChrome from="VitalWatch Alerts" fromAddr="alerts@vitalwatch.app" to={caregiverTo}
          subject={`⚠️ Missed medication alert — ${user.name}`}>
          <EmailBody accent="rose" badge="Escalation alert" badgeTone="red"
            heading={`${user.name} has not taken a scheduled dose`}
            lead={`A medication dose was not logged within the escalation window. As ${user.name}'s designated caregiver, you're being notified so you can follow up.`}
            rows={[
              ['Medication', `${dose.name} ${dose.dosage}`],
              ['Scheduled for', fmtTime12(dose.time)],
              ['Status', `Overdue by ${overdue}`],
              ['Patient', user.name],
            ]}
            cta={{ label: 'Open caregiver dashboard', icon: 'eye' }}
            footnote={`You are receiving this because missed-dose alerts are enabled for ${user.name}. Manage alert preferences in VitalWatch settings.`} />
        </EmailChrome>
      ) : (
        <EmailChrome from="VitalWatch" fromAddr="reminders@vitalwatch.app" to={`${user.name} <${user.email}>`}
          subject={`⏰ Time for your ${dose.name}`}>
          <EmailBody accent="brand" badge="Medication reminder" badgeTone="amber"
            heading={`Hi ${first}, it's time for your ${dose.name}`}
            lead={`This is your reminder to take ${dose.name} (${dose.dosage}), scheduled for ${fmtTime12(dose.time)}. Open VitalWatch and check in once you've taken it.`}
            rows={[
              ['Medication', `${dose.name} ${dose.dosage}`],
              ['Scheduled for', fmtTime12(dose.time)],
            ]}
            cta={{ label: 'Check in — mark as taken', icon: 'check' }}
            footnote={`If you've already taken this dose, you can ignore this email. If you miss it by more than ${dose.escalation || 30} minutes, your caregiver will be notified automatically.`} />
        </EmailChrome>
      ))}
    </Modal>
  );
}

// ---- A single dose row used in the check-in card --------------------------
function DoseRow({ r, onPreview }) {
  const { actions, toast } = useStore();
  const st = doseState(r);
  const meta = DOSE_META[st.status] || DOSE_META.upcoming;
  const t = TONES[meta.tone];

  const take = () => { actions.checkInDose(r.id); toast({ tone: 'success', title: `${r.name} marked as taken`, message: `Logged for ${fmtTime12(r.time)} today.` }); };
  const undo = () => { actions.undoDose(r.id); toast({ tone: 'info', title: `${r.name} check-in undone` }); };

  return (
    <div className={cx('flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3.5', st.status === 'taken' ? 'border-emerald-200 bg-emerald-50/50' : st.status === 'escalated' ? 'border-rose-200 bg-rose-50/40' : st.status === 'late' ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-white')}>
      <div className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-xl', t.soft, t.icon)}>
        <Icon name="pill" size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[15px] font-bold text-slate-900">{r.name}</p>
          <span className="whitespace-nowrap text-sm text-slate-500">{r.dosage}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-slate-500">
          <Icon name="clock" size={13} className="text-slate-400" />{fmtTime12(r.time)}
          <span className={cx('ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold', t.bg, t.text)}>
            <Icon name={meta.icon} size={11} strokeWidth={2.5} />{meta.label}
          </span>
        </div>
        {(st.status === 'late' || st.status === 'escalated') && (
          <button onClick={() => onPreview(st.status === 'escalated' ? 'caregiver' : 'patient', { ...r, overdueMin: st.overdueMin })}
            className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:underline underline-offset-2">
            <Icon name={st.status === 'escalated' ? 'mail-check' : 'mail'} size={13} />
            {st.status === 'escalated' ? 'Caregiver emailed · view' : 'Reminder emailed to you · view'}
          </button>
        )}
      </div>
      <div className="shrink-0">
        {st.status === 'taken' ? (
          <Button variant="ghost" size="sm" icon="rotate-ccw" onClick={undo}>Undo</Button>
        ) : (
          <Button size="sm" icon="check" onClick={take}>Mark as taken</Button>
        )}
      </div>
    </div>
  );
}

// ---- Reminders page: daily check-in card ----------------------------------
function TodayCheckIn() {
  const { reminders } = useStore();
  const [mail, setMail] = React.useState(null); // {kind, dose}
  const due = reminders.filter(isDueToday);
  const taken = due.filter(r => r.adherence[todayIdx()] === 'taken').length;
  const today = new Date();
  const dateLbl = `${DAYS[today.getDay()]}, ${MONTHS[today.getMonth()]} ${today.getDate()}`;

  const preview = (kind, dose) => setMail({ kind, dose });

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle icon="calendar-check" title="Today's Check-In" sub={dateLbl} />
        {due.length > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${due.length ? (taken / due.length) * 100 : 0}%` }} />
            </div>
            <span className="text-sm font-bold text-slate-700 tabular-nums">{taken}/{due.length} taken</span>
          </div>
        )}
      </div>

      {due.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
          <Icon name="check-circle" size={16} className="text-emerald-500" />No medications scheduled for today.
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {due.map(r => <DoseRow key={r.id} r={r} onPreview={preview} />)}
        </div>
      )}

      {due.length > 0 && taken === due.length && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm font-semibold text-emerald-700">
          <Icon name="check-circle" size={16} />All done for today — every dose checked in. Nice work.
        </div>
      )}

      <EmailPreviewModal open={!!mail} onClose={() => setMail(null)} kind={mail?.kind} dose={mail?.dose} />
    </Card>
  );
}

// ---- Dashboard: prominent in-app medication reminder banner ---------------
function MedReminderBanner() {
  const { reminders, actions, toast } = useStore();
  const [mail, setMail] = React.useState(null);
  const overdue = patientReminders(reminders);
  if (overdue.length === 0) return null;
  const escalated = overdue.some(x => x.st.status === 'escalated');

  return (
    <Card className={cx('p-5 border-l-4', escalated ? 'border-l-rose-500' : 'border-l-amber-400')}>
      <div className="flex items-start gap-3">
        <div className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', escalated ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500')}>
          <Icon name="bell-ring" size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-slate-900">{overdue.length === 1 ? 'A medication is due' : `${overdue.length} medications are due`}</p>
          <p className="text-[13px] text-slate-500">
            {escalated ? 'A dose is past its escalation window — your caregiver has been notified.' : 'You have a reminder waiting. Check in once you’ve taken it.'}
          </p>
          <div className="mt-3 space-y-2">
            {overdue.map(({ r, st }) => (
              <div key={r.id} className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
                <Icon name="pill" size={16} className={st.status === 'escalated' ? 'text-rose-500' : 'text-amber-500'} />
                <span className="text-sm font-semibold text-slate-800">{r.name}</span>
                <span className="text-sm text-slate-500">{r.dosage} · {fmtTime12(r.time)}</span>
                <button onClick={() => setMail({ kind: st.status === 'escalated' ? 'caregiver' : 'patient', dose: { ...r, overdueMin: st.overdueMin } })}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand hover:underline underline-offset-2">
                  <Icon name={st.status === 'escalated' ? 'mail-check' : 'mail'} size={12} />view email
                </button>
                <Button size="sm" icon="check" className="ml-auto" onClick={() => { actions.checkInDose(r.id); toast({ tone: 'success', title: `${r.name} marked as taken` }); }}>Mark taken</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <EmailPreviewModal open={!!mail} onClose={() => setMail(null)} kind={mail?.kind} dose={mail?.dose} />
    </Card>
  );
}

Object.assign(window, { EmailPreviewModal, EmailChrome, EmailBody, DoseRow, TodayCheckIn, MedReminderBanner, DOSE_META });
