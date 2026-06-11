// ── Pages: Login & Register ────────────────────────────────────────────────
function AuthShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, #E8F5E9 0%, #F2F9F4 38%, #F6F8F7 100%)' }}>
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-brand/5 blur-3xl" />
      <div className="relative w-full max-w-md vw-fade-up">
        <div className="flex flex-col items-center mb-6">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/20 mb-3">
            <Icon name="shield-check" size={28} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">Vital<span className="text-brand">Watch</span></span>
          <p className="text-sm text-slate-500 mt-1">AI-powered health monitoring</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder, error }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input leftIcon="lock" type={show ? 'text' : 'password'} placeholder={placeholder} value={value} onChange={onChange} error={error} className="pr-10" />
      <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        <Icon name={show ? 'eye-off' : 'eye'} size={16} />
      </button>
    </div>
  );
}

function LoginPage() {
  const { toast, actions } = useStore();
  const [email, setEmail] = React.useState('eleanor.hayes@example.com');
  const [pw, setPw] = React.useState('demo1234');
  const [loading, setLoading] = React.useState(false);
  const submit = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); actions.setAuth(true); toast({ title: 'Welcome back!' }); navigate('/dashboard'); }, 900); };
  return (
    <AuthShell>
      <Card className="p-7 shadow-xl">
        <h1 className="text-xl font-bold text-slate-900">Sign in to your account</h1>
        <p className="text-sm text-slate-500 mt-1">Enter your credentials to continue.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Email"><Input leftIcon="mail" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></Field>
          <Field label="Password"><PasswordInput value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" /></Field>
          <div className="flex justify-end"><button type="button" onClick={() => toast({ tone: 'info', title: 'Reset link sent (demo)' })} className="text-sm font-semibold text-brand hover:underline">Forgot password?</button></div>
          <Button type="submit" size="lg" loading={loading} className="w-full justify-center">Sign In</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Don't have an account? <button onClick={() => navigate('/register')} className="font-semibold text-brand hover:underline">Create one</button></p>
      </Card>
    </AuthShell>
  );
}

function RegisterPage() {
  const { toast, actions } = useStore();
  const [f, setF] = React.useState({ name: '', email: '', pw: '', confirm: '' });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const set = (k, v) => { setF(s => ({ ...s, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) er.email = 'Enter a valid email';
    if (f.pw.length < 6) er.pw = 'At least 6 characters';
    if (f.confirm !== f.pw) er.confirm = 'Passwords do not match';
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true); setTimeout(() => { setLoading(false); actions.setAuth(true); toast({ title: 'Account created!' }); navigate('/dashboard'); }, 1000);
  };
  return (
    <AuthShell>
      <Card className="p-7 shadow-xl">
        <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1">Start monitoring your health in minutes.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Full Name" error={errors.name}><Input leftIcon="user" placeholder="Jane Doe" value={f.name} onChange={e => set('name', e.target.value)} error={!!errors.name} /></Field>
          <Field label="Email" error={errors.email}><Input leftIcon="mail" type="email" placeholder="you@example.com" value={f.email} onChange={e => set('email', e.target.value)} error={!!errors.email} /></Field>
          <Field label="Password" error={errors.pw}><PasswordInput value={f.pw} onChange={e => set('pw', e.target.value)} placeholder="At least 6 characters" error={!!errors.pw} /></Field>
          <Field label="Confirm Password" error={errors.confirm}><PasswordInput value={f.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Re-enter password" error={!!errors.confirm} /></Field>
          <Button type="submit" size="lg" loading={loading} className="w-full justify-center">Create Account</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <button onClick={() => navigate('/login')} className="font-semibold text-brand hover:underline">Sign in</button></p>
      </Card>
    </AuthShell>
  );
}

Object.assign(window, { LoginPage, RegisterPage });
