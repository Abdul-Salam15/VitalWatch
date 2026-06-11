import { Icon } from '@/components/ui/icon';

export function AuthShell({ children }: { children: React.ReactNode }) {
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
