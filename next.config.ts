import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/tool/merge', destination: '/tool/merge-pdf', permanent: true },
      { source: '/tool/merge/pdf', destination: '/tool/merge-pdf', permanent: true },
      { source: '/tool/split', destination: '/tool/split-pdf', permanent: true },
      { source: '/tool/watermark', destination: '/tool/watermark-pdf', permanent: true },
      { source: '/tool/extract', destination: '/tool/extract-pdf', permanent: true },
      { source: '/tool/compress', destination: '/tool/compress-pdf', permanent: true },
      { source: '/tool/rotate', destination: '/tool/rotate-pdf', permanent: true },
      { source: '/tool/repair', destination: '/tool/repair-pdf', permanent: true },
      { source: '/tool/highlight', destination: '/tool/highlight-pdf', permanent: true },
      { source: '/tool/ocr', destination: '/tool/ocr-pdf', permanent: true },
      { source: '/tool/underline', destination: '/tool/underline-pdf', permanent: true },
      { source: '/tool/strikeout', destination: '/tool/strikeout-pdf', permanent: true },
      { source: '/tool/unlock', destination: '/tool/unlock-pdf', permanent: true },
      { source: '/tool/protect', destination: '/tool/protect-pdf', permanent: true },
      { source: '/tool/redact', destination: '/tool/redact-pdf', permanent: true },
      { source: '/tool/stamp', destination: '/tool/stamp-pdf', permanent: true },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
