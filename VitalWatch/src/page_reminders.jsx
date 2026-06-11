// ── Page: Reminders ────────────────────────────────────────────────────────
function ReminderDialog({ open, onClose, editing }) {
  const { actions, toast } = useStore();
  const blank = { name: '', dosage: '', time: '08:00', frequency: 'Daily', customDays: [], escalation: 30, active: true };
  const [form, setForm] = React.useState(blank);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => { if (open) { setForm(editing ? { ...editing } : blank); setErrors({}); } }, [open, editing]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };
  const toggleDay = (i) => setForm(f => ({ ...f, customDays: f.customDays.includes(i) ? f.customDays.filter(d => d !== i) : [...f.customDays, i].sort() }));

  const save = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Medication name is required';
    if (!form.dosage.trim()) e.dosage = 'Dosage is required';
    if (!form.time) e.time = 'Scheduled time is required';
    if (form.frequency === 'Custom' && form.customDays.length === 0) e.customDays = 'Select at least one day';
    setErrors(e);
    if (Object.keys(e).length) return;
    if (editing) { actions.updateReminder(editing.id, form); toast({ title: 'Reminder updated' }); }
    else { actions.addReminder(form); toast({ title: 'Reminder added', message: `${form.name} ${form.dosage} at ${fmtTime12(form.time)}` }); }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} icon="pill" title={editing ? 'Edit Reminder' : 'Add Reminder'}
      description={editing ? 'Update this medication schedule.' : 'Schedule a new medication reminder.'}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button icon="check" onClick={save}>{editing ? 'Save Changes' : 'Save Reminder'}</Button></>}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Medication Name" error={errors.name}><Input placeholder="e.g. Metformin" value={form.name} onChange={e => set('name', e.target.value)} error={!!errors.name} /></Field>
          <Field label="Dosage" error={errors.dosage}><Input placeholder="e.g. 500mg, 1 tablet" value={form.dosage} onChange={e => set('dosage', e.target.value)} error={!!errors.dosage} /></Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Scheduled Time" error={errors.time}><Input type="time" value={form.time} onChange={e => set('time', e.target.value)} error={!!errors.time} /></Field>
          <Field label="Frequency">
            <Select value={form.frequency} onChange={e => set('frequency', e.target.value)}>
              <option>Daily</option><option>Weekdays</option><option>Weekends</option><option value="Custom">Custom days</option>
            </Select>
          </Field>
        </div>

        {form.frequency === 'Custom' && (
          <Field label="Custom Days" error={errors.customDays}>
            <div className="flex flex-wrap gap-2">
              {WEEK.map((d, i) => {
                const on = form.customDays.includes(i);
                return (
                  <button key={i} type="button" onClick={() => toggleDay(i)}
                    className={cx('h-10 w-12 rounded-lg text-sm font-semibold transition-colors border', on ? 'bg-brand text-white border-brand' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-200')}>
                    {d}
                  </button>
                );
              })}
            </div>
          </Field>
        )}

        <Field label="Escalation Delay" hint="Minutes before caregiver is notified if dose is missed">
          <Input type="number" unit="min" value={form.escalation} onChange={e => set('escalation', +e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

function ReminderCard({ r }) {
  const { actions, toast } = useStore();
  const [edit, setEdit] = React.useState(false);
  return (
    <>
      <Card className={cx('p-5 transition-shadow hover:shadow-md', !r.active && 'opacity-70')}>
        <div className="flex items-start gap-4">
          <div className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-xl', r.active ? 'bg-brand-light text-brand' : 'bg-slate-100 text-slate-400')}>
            <Icon name="pill" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-[18px] font-bold text-slate-900">{r.name}</h4>
              <Badge tone={r.active ? 'green' : 'slate'}>{freqLabel(r)}</Badge>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{r.dosage} · <Icon name="clock" size={13} className="inline -mt-0.5 text-slate-400" /> {fmtTime12(r.time)}</p>
          </div>
          <div className="flex items-center gap-1">
            <Toggle checked={r.active} onChange={() => actions.toggleReminder(r.id)} />
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-2"><span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">This week</span></div>
            <div className="flex gap-1 sm:gap-1.5">
              {WEEK.map((d, i) => { const a = ADH[r.adherence[i]] || ADH.none; return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1" title={`${d}: ${a.label}`}>
                  <span className={cx('grid h-7 w-7 max-w-full place-items-center rounded-full', a.cls)}><Icon name={a.icon} size={12} strokeWidth={2.5} /></span>
                  <span className="text-[10px] font-medium text-slate-400">{d[0]}</span>
                </div>
              ); })}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 pb-6">
            <button onClick={() => setEdit(true)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Icon name="pencil" size={16} /></button>
            <button onClick={() => { actions.deleteReminder(r.id); toast({ tone: 'info', title: `${r.name} reminder deleted` }); }} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Icon name="trash-2" size={16} /></button>
          </div>
        </div>
      </Card>
      <ReminderDialog open={edit} onClose={() => setEdit(false)} editing={r} />
    </>
  );
}

function AdherenceTable() {
  const { reminders } = useStore();
  if (!reminders.length) return null;
  return (
    <Card className="p-6 overflow-hidden">
      <SectionTitle icon="calendar" title="This Week's Adherence" sub="Per-medication breakdown" />
      <div className="mt-5 -mx-6 overflow-x-auto vw-scroll">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="text-left">
              <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Medication</th>
              {WEEK.map(d => <th key={d} className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">{d}</th>)}
              <th className="px-6 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Rate</th>
            </tr>
          </thead>
          <tbody>
            {reminders.map(r => {
              const due = r.adherence.filter(s => s === 'taken' || s === 'missed').length;
              const taken = r.adherence.filter(s => s === 'taken').length;
              const rate = due ? Math.round((taken / due) * 100) : 0;
              return (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-6 py-3"><div className="flex items-center gap-2"><span className={cx('h-2 w-2 rounded-full', r.active ? 'bg-brand' : 'bg-slate-300')} /><span className="text-sm font-semibold text-slate-800">{r.name}</span></div></td>
                  {r.adherence.map((s, i) => (
                    <td key={i} className="px-2 py-3 text-center">
                      {s === 'taken' ? <Icon name="check" size={16} className="mx-auto text-emerald-500" strokeWidth={2.5} />
                        : s === 'missed' ? <Icon name="x" size={16} className="mx-auto text-rose-500" strokeWidth={2.5} />
                        : s === 'pending' ? <Icon name="clock" size={15} className="mx-auto text-amber-400" />
                        : <span className="text-slate-300">·</span>}
                    </td>
                  ))}
                  <td className="px-6 py-3 text-right"><span className={cx('text-sm font-bold tabular-nums', rate >= 80 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-rose-600')}>{rate}%</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function RemindersPage() {
  const { reminders } = useStore();
  const [add, setAdd] = React.useState(false);
  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle icon="bell" title="Medication Schedule" sub={`${reminders.filter(r=>r.active).length} active reminder${reminders.filter(r=>r.active).length!==1?'s':''}`} />
        <Button icon="plus" onClick={() => setAdd(true)}>Add Reminder</Button>
      </div>

      {reminders.length > 0 && <TodayCheckIn />}

      {reminders.length === 0 ? (
        <Card><EmptyState icon="bell-ring" title="No reminders yet" message="Add your first medication to start tracking doses and adherence."
          action={<Button icon="plus" onClick={() => setAdd(true)}>Add Reminder</Button>} /></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 vw-stagger">
            {reminders.map(r => <ReminderCard key={r.id} r={r} />)}
          </div>
          <AdherenceTable />
        </>
      )}

      <ReminderDialog open={add} onClose={() => setAdd(false)} editing={null} />
    </div>
  );
}

window.RemindersPage = RemindersPage;
