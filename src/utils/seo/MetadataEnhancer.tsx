/**
 * MetadataEnhancer.tsx
 * 
 * A utility component and hooks for enhancing SEO metadata for web routes.
 * This file is used only on web platforms to improve search engine visibility.
 */

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Platform } from 'react-native';

export interface MetadataProps {
  /**
   * Page title (will be appended with app name)
   */
  title?: string;
  
  /**
   * Page description for search engines
   */
  description?: string;
  
  /**
   * Keywords relevant to the page
   */
  keywords?: string[];
  
  /**
   * The URL of the canonical version of the page
   */
  canonicalUrl?: string;
  
  /**
   * Open Graph type (e.g., website, article)
   */
  ogType?: 'website' | 'article' | 'profile' | 'book' | string;
  
  /**
   * Open Graph image URL
   */
  ogImage?: string;
  
  /**
   * Twitter card type
   */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  
  /**
   * Any additional metadata tags as key-value pairs
   */
  additionalTags?: Record<string, string>;
  
  /**
   * App name to append to title
   */
  appName?: string;
  
  /**
   * Schema.org JSON-LD data for rich results
   */
  jsonLd?: Record<string, any>;
}

/**
 * PageMetadata component for enhancing SEO on web
 */
export const PageMetadata: React.FC<MetadataProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  twitterCard = 'summary',
  additionalTags = {},
  appName = 'EcoCart',
  jsonLd,
}) => {
  // Only render on web platform
  if (Platform.OS !== 'web') {
    return null;
  }
  
  // Format the page title with app name
  const formattedTitle = title ? `${title} | ${appName}` : appName;
  
  // Format keywords array into a string
  const keywordsString = keywords?.join(', ') || '';
  
  return (
    <Helmet>
      {/* Basic metadata */}
      <title>{formattedTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywordsString && <meta name="keywords" content={keywordsString} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph data */}
      <meta property="og:title" content={formattedTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter Card data */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={formattedTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Additional custom tags */}
      {Object.entries(additionalTags).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}
      
      {/* JSON-LD structured data for rich results */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

/**
 * Hook to update page metadata
 */
export function usePageMetadata(metadata: MetadataProps): void {
  useEffect(() => {
    // Additional side effects can be handled here if needed
    // For example, you might want to log page views to analytics
  }, [metadata]);
}

/**
 * Helper to generate structured data for different types of content
 */
export const StructuredData = {
  /** 
   * Generate structured data for an article or blog post
   */
  article: (options: {
    headline: string;
    image: string;
    datePublished: string;
    dateModified?: string;
    authorName: string;
    publisherName: string;
    publisherLogo: string;
    description?: string;
  }) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: options.headline,
      image: options.image,
      datePublished: options.datePublished,
      dateModified: options.dateModified || options.datePublished,
      author: {
        '@type': 'Person',
        name: options.authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: options.publisherName,
        logo: {
          '@type': 'ImageObject',
          url: options.publisherLogo,
        },
      },
      description: options.description,
    };
  },
  
  /**
   * Generate structured data for a product
   */
  product: (options: {
    name: string;
    image: string;
    description?: string;
    sku?: string;
    brand?: string;
    price?: number;
    priceCurrency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    url?: string;
    reviewCount?: number;
    ratingValue?: number;
  }) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: options.name,
      image: options.image,
      description: options.description,
      sku: options.sku,
      brand: options.brand ? {
        '@type': 'Brand',
        name: options.brand,
      } : undefined,
      offers: {
        '@type': 'Offer',
        price: options.price,
        priceCurrency: options.priceCurrency,
        availability: options.availability ? 
          `https://schema.org/${options.availability}` : 
          undefined,
        url: options.url,
      },
      ...(options.reviewCount && options.ratingValue ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: options.ratingValue,
          reviewCount: options.reviewCount,
        }
      } : {}),
    };
  },
  
  /**
   * Generate structured data for local business
   */
  localBusiness: (options: {
    name: string;
    image: string;
    telephone?: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      postalCode: string;
      addressCountry: string;
    };
    geo?: {
      latitude: number;
      longitude: number;
    };
    url?: string;
    priceRange?: string;
  }) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: options.name,
      image: options.image,
      telephone: options.telephone,
      address: {
        '@type': 'PostalAddress',
        ...options.address,
      },
      ...(options.geo ? {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: options.geo.latitude,
          longitude: options.geo.longitude,
        }
      } : {}),
      url: options.url,
      priceRange: options.priceRange,
    };
  },
};

export default PageMetadata; 