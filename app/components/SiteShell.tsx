import { Navbar } from './Navbar';
import { SidebarNav } from './SidebarNav';
import { TopAnnouncementBar } from './TopAnnouncementBar';

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#f4f6f8' }}>
      <div className="sticky top-0 z-50">
        <TopAnnouncementBar />
        <Navbar />
      </div>
      <SidebarNav />
      {children}
    </div>
  );
}
