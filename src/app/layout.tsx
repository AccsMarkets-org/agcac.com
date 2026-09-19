import type { Metadata } from 'next';
import Script from 'next/script';
import CookieBanner from '@/components/legal/CookieBanner';
import './globals.css';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX';
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-XXXXXXXXXX';
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || 'XXXXXXXXXXXXXXX';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.alghawasac.com'),
  title: {
    default: 'Al Ghawas A/C Refrigeration Contracting LLC | HVAC Company Abu Dhabi',
    template: '%s | Al Ghawas A/C Abu Dhabi',
  },
  description:
    'Al Ghawas A/C Refrigeration Contracting LLC — Professional HVAC, air conditioning installation, maintenance, repair, ducting, VRF, chilled water, refrigeration, and plumbing services in Abu Dhabi, UAE. Since 2005. Call +971-50-672-5808.',
  keywords: [
    'HVAC company Abu Dhabi',
    'AC maintenance Abu Dhabi',
    'AC repair Abu Dhabi',
    'AC installation Abu Dhabi',
    'air conditioning contractor UAE',
    'refrigeration company Abu Dhabi',
    'duct fabrication Abu Dhabi',
    'VRF system installation UAE',
    'chilled water pipe works Abu Dhabi',
    'emergency AC repair Abu Dhabi',
    'villa AC maintenance Abu Dhabi',
    'commercial HVAC contractor Abu Dhabi',
    'annual maintenance contract Abu Dhabi',
    'Al Ghawas AC',
    'HVAC contractor Mohamed Bin Zayed City',
  ],
  authors: [{ name: 'Al Ghawas A/C Refrigeration Contracting LLC' }],
  creator: 'Al Ghawas A/C Refrigeration Contracting LLC',
  publisher: 'Al Ghawas A/C Refrigeration Contracting LLC',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    url: 'https://www.alghawasac.com',
    siteName: 'Al Ghawas A/C Refrigeration Contracting LLC',
    title: 'Al Ghawas A/C — Professional HVAC & Refrigeration Services in Abu Dhabi',
    description:
      'Trusted HVAC contractor in Abu Dhabi since 2005. AC installation, maintenance, repair, ducting, VRF, chilled water, refrigeration. Get a free quote today.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Al Ghawas HVAC Services Abu Dhabi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Al Ghawas A/C — HVAC Services in Abu Dhabi',
    description: 'Professional HVAC, refrigeration, and AC services in Abu Dhabi since 2005.',
    images: ['/images/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.alghawasac.com',
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'HVACBusiness',
  name: 'Al Ghawas A/C Refrigeration Contracting LLC',
  url: 'https://www.alghawasac.com',
  logo: 'https://www.alghawasac.com/images/logo.png',
  image: 'https://www.alghawasac.com/images/og-image.jpg',
  description:
    'Professional HVAC, air conditioning, refrigeration, ducting, plumbing, ventilation, VRF, and chilled water services in Abu Dhabi, UAE.',
  telephone: '+971506725808',
  email: 'info@alghawasac.com',
  foundingDate: '2005',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Building No.238, Mohamed Bin Zayed City, ME-11',
    addressLocality: 'Abu Dhabi',
    addressCountry: 'AE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 24.3417,
    longitude: 54.5142,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '07:00',
      closes: '20:00',
    },
  ],
  priceRange: '$$',
  areaServed: {
    '@type': 'Place',
    name: 'Abu Dhabi, UAE',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'HVAC Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AC Installation' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AC Maintenance' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AC Repair' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Duct Fabrication' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'VRF System Installation' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Chilled Water Works' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Refrigeration Services' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Annual Maintenance Contract' } },
    ],
  },
  sameAs: ['https://www.alghawasac.com'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>

        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_ID}', { send_page_view: true });`}
        </Script>

        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');`}
        </Script>

        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body>
        {/* Google Tag Manager noscript */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
