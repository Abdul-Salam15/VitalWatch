// ── Page: Settings ─────────────────────────────────────────────────────────
function ProfileSection() {
  const { user, actions, toast } = useStore();
  const [name, setName] = React.useState(user.name);
  const dirty = name !== user.name;
  return (
    <Card className="p-6">
      <SectionTitle icon="user" title="Profile" sub="Manage your personal information" />
      <div className="mt-5 flex flex-col sm:flex-row gap-6">
        <div className="group relative w-fit">
          <Avatar name={name} size={72} />
          <button className="absolute inset-0 grid place-items-center rounded-full bg-slate-900/55 text-white opacity-0 group-hover:opacity-100 transition" title="Edit avatar">
            <Icon name="pencil" size={18} />
          </button>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name"><Input value={name} onChange={e => setName(e.target.value)} /></Field>
          <Field label="Email">
            <div className="relative">
              <Input value={user.email} readOnly className="bg-slate-50 text-slate-500 pr-10" />
              <Icon name="lock" size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </Field>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Button disabled={!dirty} onClick={() => { actions.updateUser({ name }); toast({ title: 'Profile saved' }); }}>Save Changes</Button>
      </div>
    </Card>
  );
}

function CaregiverSection() {
  const { settings, actions, toast } = useStore();
  const [email, setEmail] = React.useState(settings.caregiverEmail);
  const [error, setError] = React.useState('');
  const valid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const save = () => {
    if (email && !valid(email)) { setError('Enter a valid email address'); return; }
    setError(''); actions.updateSettings({ caregiverEmail: email });
    toast({ title: email ? 'Caregiver email saved' : 'Caregiver email cleared' });
  };
  return (
    <Card className="p-6">
      <SectionTitle icon="users" title="Caregiver" sub="Who gets notified about your health" />
      <div className="mt-5 max-w-md">
        <Field label="Caregiver Email" hint="This email receives missed dose alerts and anomaly notifications" error={error}>
          <Input leftIcon="mail" type="email" placeholder="caregiver@example.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} error={!!error} />
        </Field>
      </div>
      <div className="mt-5 flex justify-end"><Button onClick={save}>Save</Button></div>
    </Card>
  );
}

function NotifRow({ title, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-slate-800">{title}</p>
        <p className="text-[13px] text-slate-500">{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function NotificationsSection() {
  const { settings, actions } = useStore();
  const n = settings.notif;
  const upd = (k, v) => actions.updateSettings({ notif: { ...n, [k]: v } });
  return (
    <Card className="p-6">
      <SectionTitle icon="bell" title="Notifications" sub="Choose what you want to hear about" />
      <div className="mt-3 divide-y divide-slate-100">
        <NotifRow title="Enable Browser Notifications" desc="Get push reminders for upcoming doses in your browser" checked={n.browser} onChange={v => upd('browser', v)} />
        <NotifRow title="Email me medication reminders" desc="Send an email reminder to you when a dose becomes due" checked={n.medReminderEmail !== false} onChange={v => upd('medReminderEmail', v)} />
        <NotifRow title="Email me my daily AI summary" desc="A morning digest of your vitals and AI analysis" checked={n.emailSummary} onChange={v => upd('emailSummary', v)} />
        <NotifRow title="Alert caregiver on missed / late dose" desc="Email your caregiver when a dose isn't taken within the escalation window" checked={n.caregiverMissedDose !== false} onChange={v => upd('caregiverMissedDose', v)} />
        <NotifRow title="Notify caregiver on anomaly detection" desc="Automatically alert your caregiver when vitals are abnormal" checked={n.caregiverAnomaly} onChange={v => upd('caregiverAnomaly', v)} />
      </div>
    </Card>
  );
}

function DangerSection() {
  const { actions, toast } = useStore();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Card className="p-6 border-rose-200 bg-rose-50/40">
        <SectionTitle icon="alert-triangle" title="Danger Zone" sub="Irreversible account actions" />
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-rose-200 bg-white px-4 py-3.5">
          <div>
            <p className="text-sm font-semibold text-slate-800">Delete Account</p>
            <p className="text-[13px] text-slate-500">Permanently remove your account and all health data.</p>
          </div>
          <Button variant="destructive" icon="trash-2" onClick={() => setOpen(true)}>Delete Account</Button>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} icon="alert-triangle" title="Delete account?"
        description="This action cannot be undone."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" icon="trash-2" onClick={() => { actions.resetAll(); setOpen(false); toast({ tone: 'warning', title: 'Account data reset', message: 'All mock data restored to defaults.' }); }}>Yes, delete everything</Button></>}>
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
          <Icon name="alert-circle" size={18} className="mt-0.5 text-rose-500" />
          <p className="text-sm text-rose-700">All of your vitals, reminders, and settings will be <span className="font-semibold">permanently deleted</span>. In this demo, data is restored to defaults.</p>
        </div>
      </Modal>
    </>
  );
}

function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-5 md:space-y-6 vw-stagger">
      <ProfileSection />
      <CaregiverSection />
      <NotificationsSection />
      <DangerSection />
    </div>
  );
}

window.SettingsPage = SettingsPage;
