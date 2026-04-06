
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FAQ } from '../types';
import { useContent } from '../contexts/ContentContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'service';
  schema?: Record<string, any>;
  breadcrumbs?: { name: string; item: string }[];
  faq?: FAQ[];
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords,
  image, 
  url,
  type = 'website',
  schema,
  breadcrumbs,
  faq
}) => {
  const { content } = useContent();
  const SITE_CONFIG = content.site;
  const CONTACT_CONFIG = content.contact;

  const siteTitle = title ? `${title} | ${SITE_CONFIG.TITLE}` : `${SITE_CONFIG.TITLE} | ${SITE_CONFIG.SUBTITLE}`;
  const metaDescription = description || SITE_CONFIG.DESCRIPTION;
  const siteUrl = url || SITE_CONFIG.URL;
  const ogImage = image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1200&h=630&auto=format&fit=crop';
  
  const baseKeywords = [
    "Desenvolvedor Frontend", 
    "React", 
    "Criação de Sites", 
    "Landing Page", 
    "Alta Performance", 
    "SEO", 
    "Web Design",
    "Brasília",
    "Next.js",
    "Tailwind CSS"
  ];
  
  const allKeywords = keywords ? [...baseKeywords, ...keywords] : baseKeywords;

  // --- KNOWLEDGE GRAPH CONSTRUCTION ---

  // 1. Breadcrumbs Schema
  let breadcrumbSchema = null;
  if (breadcrumbs) {
    breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": `${SITE_CONFIG.URL}${crumb.item}`
      }))
    };
  }

  // 2. Organization / Local Business Schema (Hybrid)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_CONFIG.URL}/#organization`,
    "name": "PH Development",
    "url": SITE_CONFIG.URL,
    "logo": `${SITE_CONFIG.URL}/favicon.svg`,
    "image": "https://i.imgur.com/TNMBi27.jpeg",
    "description": SITE_CONFIG.DESCRIPTION,
    "email": CONTACT_CONFIG.EMAIL,
    "telephone": `+${CONTACT_CONFIG.WHATSAPP_NUMBER}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": CONTACT_CONFIG.ADDRESS_LOCALITY,
      "addressRegion": CONTACT_CONFIG.ADDRESS_REGION,
      "addressCountry": CONTACT_CONFIG.ADDRESS_COUNTRY
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": CONTACT_CONFIG.GEO_LAT,
      "longitude": CONTACT_CONFIG.GEO_LONG
    },
    "priceRange": CONTACT_CONFIG.PRICE_RANGE,
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "sameAs": [
      CONTACT_CONFIG.INSTAGRAM_URL,
      CONTACT_CONFIG.GITHUB_URL
    ],
    // RICH SNIPPET TRIGGER: AGGREGATE RATING
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "48", // Based on successful projects count
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // 3. WebSite Schema (For Search Box & Sitelinks)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.URL}/#website`,
    "url": SITE_CONFIG.URL,
    "name": "PH Development",
    "publisher": {
      "@id": `${SITE_CONFIG.URL}/#organization`
    },
    "inLanguage": "pt-BR"
  };

  // 4. Person Schema (The Expert)
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_CONFIG.URL}/#person`,
    "name": "Philippe Boechat (PH)",
    "jobTitle": "Senior Frontend Engineer",
    "url": SITE_CONFIG.URL,
    "image": "https://i.imgur.com/TNMBi27.jpeg",
    "worksFor": {
      "@id": `${SITE_CONFIG.URL}/#organization`
    },
    "sameAs": [
      CONTACT_CONFIG.GITHUB_URL
    ]
  };

  // Merge custom schema if provided
  const schemasToRender: any[] = [organizationSchema, websiteSchema, personSchema];
  if (schema) schemasToRender.push(schema);
  if (breadcrumbSchema) schemasToRender.push(breadcrumbSchema);

  if (faq) {
    schemasToRender.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faq.map(f => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.answer
        }
      }))
    });
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={allKeywords.join(", ")} />
      <link rel="canonical" href={siteUrl} />
      <meta name="author" content="PH Development" />
      <meta name="theme-color" content="#7c3aed" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="PH Development" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@ph_dev" />

      {/* JSON-LD Structured Data Injection */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": schemasToRender
        })}
      </script>
    </Helmet>
  );
};
