import { cx, initials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, size = 40, className = '' }: AvatarProps) {
  return (
    <div
      className={cx('grid place-items-center rounded-full bg-brand text-white font-semibold', className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  );
}
