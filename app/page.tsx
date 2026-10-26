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
import { fetchHomePageContent } from './admin/lib/home-page-api';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const home = await fetchHomePageContent();
  const site = getSiteUrl();
  return {
    title: home.seoTitle,
    description: home.seoDescription,
    alternates: { canonical: `${site}/` },
    openGraph: {
      title: home.seoTitle,
      description: home.seoDescription,
      url: `${site}/`,
      siteName: 'GoDocLab',
      type: 'website',
    },
  };
}

export default async function Home() {
  const home = await fetchHomePageContent();

  return (
    <SiteShell>
      <JsonLd data={webApplicationLd()} />
      <main>
        <HeroSection home={home} />

        <PopularToolsSection home={home} />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <ToolsCatalog mode="home" home={home} />
        </div>

        <HowOurToolsWork home={home} />

        <SecurityTrustCta home={home} />

        <WhyChooseUs home={home} />

        <ReviewsSection home={home} />

        <BlogSection />

        <FaqSection home={home} />
      </main>
    </SiteShell>
  );
}
