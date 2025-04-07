/**
 * WebLinkHandler.web.ts
 * 
 * Web-specific utilities for handling navigation, links, and URL management.
 * This file is used only on web platforms.
 */

/**
 * Parse URL parameters from a location search string
 */
export function parseUrlParams(search: string): Record<string, string> {
  const searchParams = new URLSearchParams(search);
  const params: Record<string, string> = {};
  
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  
  return params;
}

/**
 * Build a URL with parameters
 */
export function buildUrlWithParams(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const url = new URL(baseUrl, window.location.origin);
  const searchParams = new URLSearchParams(url.search);
  
  // Add or update parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });
  
  // Set the search string
  const searchString = searchParams.toString();
  
  // Construct the final URL
  return `${url.pathname}${searchString ? `?${searchString}` : ''}${url.hash}`;
}

/**
 * Open an external link in a new tab with security attributes
 */
export function openExternalLink(url: string): void {
  const newWindow = window.open(
    url,
    '_blank',
    'noopener,noreferrer'
  );
  
  // Fallback if window.open fails
  if (!newWindow) {
    window.location.href = url;
  }
}

/**
 * Check if a link is external (different domain)
 */
export function isExternalLink(url: string): boolean {
  if (!url) return false;
  
  // Handle relative URLs
  if (url.startsWith('/') && !url.startsWith('//')) {
    return false;
  }
  
  try {
    // Compare hostname with current hostname
    const currentHost = window.location.hostname;
    const urlHost = new URL(url, window.location.origin).hostname;
    
    return urlHost !== currentHost;
  } catch (e) {
    // If URL parsing fails, consider it external
    return true;
  }
}

/**
 * Handle special links (like mailto:, tel:, etc.)
 */
export function handleSpecialLink(url: string): boolean {
  const specialProtocols = ['mailto:', 'tel:', 'sms:', 'whatsapp:'];
  
  for (const protocol of specialProtocols) {
    if (url.startsWith(protocol)) {
      window.location.href = url;
      return true;
    }
  }
  
  return false;
}

/**
 * Get the current browser location 
 */
export function getCurrentLocation(): {
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  params: Record<string, string>;
} {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    origin: window.location.origin,
    params: parseUrlParams(window.location.search),
  };
}

/**
 * Handle history navigation
 */
export function navigateBack(): void {
  window.history.back();
}

/**
 * Scroll to an element by ID
 */
export function scrollToElement(
  elementId: string, 
  options?: { behavior?: 'auto' | 'smooth'; block?: 'start' | 'center' | 'end' | 'nearest' }
): void {
  const element = document.getElementById(elementId);
  
  if (element) {
    element.scrollIntoView({
      behavior: options?.behavior || 'smooth',
      block: options?.block || 'start',
    });
  }
}

/**
 * Prefetch a route or resource
 */
export function prefetchRoute(url: string): void {
  // Create a link element for prefetching
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = 'document';
  
  // Add the link to the document head
  document.head.appendChild(link);
}

/**
 * Convert a route path to a breadcrumb array
 */
export function pathToBreadcrumbs(
  path: string,
  routeMap: Record<string, { title: string; path: string }>
): Array<{ title: string; path: string }> {
  // Remove leading and trailing slashes and split by /
  const segments = path.replace(/^\/|\/$/g, '').split('/');
  
  // Build breadcrumbs
  const breadcrumbs: Array<{ title: string; path: string }> = [];
  let currentPath = '';
  
  for (const segment of segments) {
    currentPath += `/${segment}`;
    
    // Try to find the route in the route map
    const route = Object.values(routeMap).find(r => r.path === currentPath);
    
    if (route) {
      breadcrumbs.push({ title: route.title, path: route.path });
    } else {
      // If no match in route map, create a formatted title from the segment
      const formattedTitle = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      breadcrumbs.push({ title: formattedTitle, path: currentPath });
    }
  }
  
  return breadcrumbs;
} 