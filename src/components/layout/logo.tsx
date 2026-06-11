import { Icon } from '@/components/ui/icon';

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-sm">
        <Icon name="shield-check" size={20} />
      </div>
      {!collapsed && <span className="text-[19px] font-extrabold tracking-tight text-slate-900">Vital<span className="text-brand">Watch</span></span>}
    </div>
  );
}
