export interface NavItem {
  path: string;
  label: string;
  icon: string;
}

export const NAV: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { path: '/log-health', label: 'Log Health', icon: 'activity' },
  { path: '/reminders', label: 'Reminders', icon: 'bell' },
  { path: '/caregiver', label: 'Caregiver View', icon: 'users' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

export const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/log-health': 'Log Health',
  '/reminders': 'Reminders',
  '/caregiver': 'Caregiver View',
  '/settings': 'Settings',
};
