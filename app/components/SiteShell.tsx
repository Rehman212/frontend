import { Navbar } from './Navbar';
import { SidebarNav } from './SidebarNav';
import { TopAnnouncementBar } from './TopAnnouncementBar';
import { SiteFooter } from './SiteFooter';
import { CookieConsent } from './CookieConsent';

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f4f6f8' }}>
      <div className="sticky top-0 z-50">
        <TopAnnouncementBar />
        <Navbar />
      </div>
      <SidebarNav />
      <div className="flex-1 min-h-0">{children}</div>
      <SiteFooter />
      <CookieConsent />
    </div>
  );
}
