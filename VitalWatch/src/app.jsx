// ── Router + mount ─────────────────────────────────────────────────────────
function useHashRoute() {
  const get = () => {
    let h = window.location.hash.replace(/^#/, '');
    if (!h || h === '/') return '/dashboard';
    return h;
  };
  const [route, setRoute] = React.useState(get);
  React.useEffect(() => {
    const on = () => { setRoute(get()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

const SHELL_ROUTES = {
  '/dashboard': DashboardPage,
  '/log-health': LogHealthPage,
  '/reminders': RemindersPage,
  '/caregiver': CaregiverPage,
  '/settings': SettingsPage,
};

function Router() {
  const route = useHashRoute();
  const { isAuthenticated } = useStore();

  const isAuthPage = route === '/login' || route === '/register';

  // Route guard: unauthenticated users are redirected to /login
  React.useEffect(() => {
    if (!isAuthenticated && !isAuthPage) navigate('/login');
  }, [isAuthenticated, isAuthPage]);

  if (isAuthPage) {
    const Page = route === '/register' ? RegisterPage : LoginPage;
    return <><Page /><Toaster /></>;
  }

  if (!isAuthenticated) return <><LoginPage /><Toaster /></>;

  const Page = SHELL_ROUTES[route] || DashboardPage;
  return (
    <>
      <Shell route={SHELL_ROUTES[route] ? route : '/dashboard'}>
        <div key={route} className="vw-fade-up">
          <Page />
        </div>
      </Shell>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
