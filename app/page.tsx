import { SiteShell } from './components/SiteShell';
import { HeroSection } from './components/HeroSection';
import { PopularToolsSection } from './components/PopularToolsSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FaqSection } from './components/FaqSection';
import { ReviewsSection } from './components/ReviewsSection';
import { BlogSection } from './components/BlogSection';
import { HowOurToolsWork } from './components/HowOurToolsWork';
import { SecurityTrustCta } from './components/SecurityTrustCta';
import { ToolsCatalog } from './components/ToolsCatalog';

export default function Home() {
  return (
    <SiteShell>

      <HeroSection />

      <PopularToolsSection />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <main className="flex-1 min-w-0">
          <ToolsCatalog />
        </main>
      </div>

      <HowOurToolsWork />

      <SecurityTrustCta />

      <WhyChooseUs />

      <ReviewsSection />

      <BlogSection />

      <FaqSection />

    </SiteShell>
  );
}
