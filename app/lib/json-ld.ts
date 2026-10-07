import { getSiteUrl } from './site';

export function siteGraph() {
  const site = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${site}/#organization`,
        name: 'GoDocLab',
        url: site,
        logo: {
          '@type': 'ImageObject',
          url: `${site}/icon.png`,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${site}/#website`,
        url: site,
        name: 'GoDocLab',
        description:
          'Free online PDF and image tools. Files are processed on GoDocLab servers and removed after use.',
        publisher: { '@id': `${site}/#organization` },
        inLanguage: 'en',
      },
    ],
  };
}

export function webApplicationLd() {
  const site = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'GoDocLab',
    url: site,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': `${site}/#organization` },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
