import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="page"><Header />{children}<BottomNav /></div>;
}
