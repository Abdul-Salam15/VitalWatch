// ── App shell: sidebar, mobile bottom tabs, top header ─────────────────────
const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { path: '/log-health', label: 'Log Health', icon: 'activity' },
  { path: '/reminders', label: 'Reminders', icon: 'bell' },
  { path: '/caregiver', label: 'Caregiver View', icon: 'users' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];
const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/log-health': 'Log Health',
  '/reminders': 'Reminders',
  '/caregiver': 'Caregiver View',
  '/settings': 'Settings',
};

function navigate(path) { window.location.hash = '#' + path; }

function Logo({ collapsed }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-sm">
        <Icon name="shield-check" size={20} />
      </div>
      {!collapsed && <span className="text-[19px] font-extrabold tracking-tight text-slate-900">Vital<span className="text-brand">Watch</span></span>}
    </div>
  );
}

function Sidebar({ route, collapsed, setCollapsed }) {
  const { user, actions } = useStore();
  return (
    <aside
      className="hidden md:flex flex-col shrink-0 border-r border-slate-200 bg-white transition-[width] duration-200"
      style={{ width: collapsed ? 84 : 280 }}
    >
      <div className={cx('flex items-center h-16 px-5', collapsed && 'justify-center px-0')}>
        <Logo collapsed={collapsed} />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => {
          const active = route === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={cx(
                'group flex items-center w-full rounded-xl text-[15px] font-semibold transition-colors',
                collapsed ? 'justify-center h-11' : 'gap-3 px-3.5 h-11',
                active ? 'bg-brand text-white shadow-sm' : 'text-slate-600 hover:bg-brand-tint hover:text-brand',
              )}
            >
              <Icon name={item.icon} size={20} className={active ? '' : 'text-slate-400 group-hover:text-brand'} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100 space-y-1">
        <button onClick={() => setCollapsed(c => !c)}
          className={cx('flex items-center w-full rounded-xl h-10 text-sm font-medium text-slate-500 hover:bg-slate-100', collapsed ? 'justify-center' : 'gap-3 px-3.5')}>
          <Icon name={collapsed ? 'panel-left-open' : 'panel-left-close'} size={18} />
          {!collapsed && <span>Collapse</span>}
        </button>
        <button onClick={() => { actions.setAuth(false); navigate('/login'); }}
          className={cx('flex items-center w-full rounded-xl h-10 text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600', collapsed ? 'justify-center' : 'gap-3 px-3.5')}
          title={collapsed ? 'Sign out' : undefined}>
          <Icon name="log-out" size={18} />
          {!collapsed && <span>Sign out</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-3 rounded-xl px-2 py-2 mt-1">
            <Avatar name={user.name} size={36} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function BottomTabs({ route }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {NAV.map(item => {
          const active = route === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={cx('flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold', active ? 'text-brand' : 'text-slate-400')}>
              <div className={cx('grid h-8 w-12 place-items-center rounded-full transition-colors', active && 'bg-brand-light')}>
                <Icon name={item.icon} size={20} />
              </div>
              {item.label.split(' ')[0]}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Header({ route, onMenu }) {
  const { user, logs, reminders } = useStore();
  const notifs = buildNotifications(logs, reminders);
  const [open, setOpen] = React.useState(false);
  const [readCount, setReadCount] = React.useState(0);
  const unread = Math.max(0, notifs.length - readCount);

  const toggle = () => {
    setOpen(o => {
      const next = !o;
      if (next) setReadCount(notifs.length); // mark all as read on open
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-20 flex items-center h-16 gap-3 border-b border-slate-200 bg-white/90 backdrop-blur px-4 md:px-7">
      <button onClick={onMenu} className="md:hidden grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><Icon name="menu" size={20} /></button>
      <div className="md:hidden"><Logo /></div>

      <h1 className="hidden md:block text-[22px] font-bold tracking-tight text-slate-900">{PAGE_TITLES[route] || 'VitalWatch'}</h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button onClick={toggle} className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100">
            <Icon name="bell" size={20} />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-12 z-40 w-[min(88vw,340px)] rounded-2xl border border-slate-200 bg-white shadow-xl vw-scale-in overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Notifications</span>
                  <span className="text-xs font-medium text-slate-400">{notifs.length} recent</span>
                </div>
                <div className="max-h-80 overflow-y-auto vw-scroll divide-y divide-slate-50">
                  {notifs.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-400">You're all caught up</div>
                  ) : notifs.map(n => (
                    <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-slate-50">
                      <div className="relative shrink-0">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500"><Icon name={NOTIF_ICON[n.type]} size={16} /></div>
                        <span className={cx('absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white', NOTIF_DOT[n.type])} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800">{n.text}</p>
                        <p className="truncate text-xs text-slate-500">{n.detail}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-400 whitespace-nowrap">{relTime(n.ts)}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setOpen(false); navigate('/reminders'); }} className="w-full px-4 py-2.5 text-center text-[13px] font-semibold text-brand hover:bg-brand-tint border-t border-slate-100">View all activity</button>
              </div>
            </>
          )}
        </div>
        <button onClick={() => navigate('/settings')} className="rounded-full ring-2 ring-transparent hover:ring-brand-200 transition">
          <Avatar name={user.name} size={40} />
        </button>
      </div>
    </header>
  );
}

// Mobile slide-in nav drawer
function MobileDrawer({ open, onClose, route }) {
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 vw-fade" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl vw-fade p-4 flex flex-col" style={{ animation: 'vw-fade-up .25s' }}>
        <div className="flex items-center justify-between h-12 mb-2"><Logo /><button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><Icon name="x" size={18} /></button></div>
        <nav className="space-y-1">
          {NAV.map(item => {
            const active = route === item.path;
            return (
              <button key={item.path} onClick={() => { navigate(item.path); onClose(); }}
                className={cx('flex items-center gap-3 w-full rounded-xl px-3.5 h-11 text-[15px] font-semibold', active ? 'bg-brand text-white' : 'text-slate-600 hover:bg-brand-tint')}>
                <Icon name={item.icon} size={20} />{item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function Shell({ route, children }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawer, setDrawer] = React.useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F8F7]">
      <Sidebar route={route} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header route={route} onMenu={() => setDrawer(true)} />
        <main className="flex-1 overflow-y-auto vw-scroll px-4 md:px-7 py-5 md:py-7 pb-24 md:pb-7">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <BottomTabs route={route} />
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} route={route} />
    </div>
  );
}

Object.assign(window, { NAV, PAGE_TITLES, navigate, Logo, Sidebar, BottomTabs, Header, Shell });
