import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./components/Providers";
import { JsonLd } from "./components/JsonLd";
import { siteGraph } from "./lib/json-ld";

export const metadata: Metadata = {
  metadataBase: new URL('https://godoclab.com'),
  title: 'GoDocLab — Every PDF Tool You Need',
  description: "Merge, split, compress, convert, rotate, watermark, protect PDFs and more. All tools in one place at GoDocLab.com.",
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/icon.png?v=2', type: 'image/png', sizes: '512x512' },
      { url: '/favicon-48x48.png?v=2', type: 'image/png', sizes: '48x48' },
      { url: '/favicon-32x32.png?v=2', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: [{ url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' }],
  },
  verification: {
    google: '5SzuqjZ6yShvfqh_XZYyMdHhJN4dJRdFhm8TzCtBxZA',
  },
  other: {
    'google-adsense-account': 'ca-pub-4580981084619995',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="smartlook" strategy="afterInteractive">
          {`
            window.smartlook||(function(d) {
              var o=smartlook=function(){ o.api.push(arguments)},h=d.getElementsByTagName('head')[0];
              var c=d.createElement('script');o.api=new Array();c.async=true;c.type='text/javascript';
              c.charset='utf-8';c.src='https://web-sdk.smartlook.com/recorder.js';h.appendChild(c);
            })(document);
            smartlook('init', '2b445c1b5df289a5d2782f96ae3cb81d73e5cb70', { region: 'eu' });
          `}
        </Script>
        <JsonLd data={siteGraph()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
