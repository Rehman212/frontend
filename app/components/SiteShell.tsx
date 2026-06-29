import { TOOLS } from '../lib/tools';
import { Navbar } from './Navbar';
import { SidebarNav } from './SidebarNav';

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#f4f6f8' }}>
      <Navbar totalTools={TOOLS.length} />
      <SidebarNav />
      {children}
    </div>
  );
}
