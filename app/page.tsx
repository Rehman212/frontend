import type { Metadata } from 'next';
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
import { getSiteUrl } from './lib/site';
import { JsonLd } from './components/JsonLd';
import { webApplicationLd } from './lib/json-ld';

export const metadata: Metadata = {
  title: 'GoDocLab — Every PDF Tool You Need',
  description:
    'Merge, split, compress, convert, rotate, watermark, protect PDFs and more. Files are processed securely on GoDocLab servers and removed after use. 100% free, no sign-up.',
  alternates: { canonical: `${getSiteUrl()}/` },
  openGraph: {
    title: 'GoDocLab — Every PDF Tool You Need',
    description: 'Free PDF and image tools. Processed on our servers, then deleted. No sign-up.',
    url: `${getSiteUrl()}/`,
    siteName: 'GoDocLab',
    type: 'website',
  },
};

export default function Home() {
  return (
    <SiteShell>
      <JsonLd data={webApplicationLd()} />
      <main>
        <HeroSection />

        <PopularToolsSection />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <ToolsCatalog mode="home" />
        </div>

        <HowOurToolsWork />

        <SecurityTrustCta />

        <WhyChooseUs />

        <ReviewsSection />

        <BlogSection />

        <FaqSection />
      </main>
    </SiteShell>
  );
}
