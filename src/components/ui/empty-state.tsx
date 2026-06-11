import { Icon } from '@/components/ui/icon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = 'inbox', title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-14">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-300 mb-4">
        <Icon name={icon} size={36} />
      </div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      {message && <p className="mt-1 max-w-xs text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
