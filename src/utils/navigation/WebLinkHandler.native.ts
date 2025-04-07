/**
 * WebLinkHandler.native.ts
 * 
 * Native stub for the web-specific navigation utilities.
 * This provides compatible API for native platforms, even though most functions are no-ops.
 */

/**
 * Parse URL parameters from a location search string
 * On native, this is a stub that returns an empty object
 */
export function parseUrlParams(search: string): Record<string, string> {
  return {};
}

/**
 * Build a URL with parameters
 * On native, returns the baseUrl since web URLs aren't directly used
 */
export function buildUrlWithParams(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined | null>
): string {
  return baseUrl;
}

/**
 * Open an external link in a new tab with security attributes
 * On native, use Linking.openURL instead
 */
export function openExternalLink(url: string): void {
  // This would normally use Linking.openURL from react-native
  console.warn('openExternalLink not implemented for native. Use Linking.openURL instead.');
}

/**
 * Check if a link is external (different domain)
 * On native, always returns true for URLs starting with http
 */
export function isExternalLink(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Handle special links (like mailto:, tel:, etc.)
 * On native, indicates these should be handled by Linking
 */
export function handleSpecialLink(url: string): boolean {
  const specialProtocols = ['mailto:', 'tel:', 'sms:', 'whatsapp:'];
  return specialProtocols.some(protocol => url.startsWith(protocol));
}

/**
 * Get the current location 
 * On native, returns a stub object
 */
export function getCurrentLocation(): {
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  params: Record<string, string>;
} {
  return {
    pathname: '',
    search: '',
    hash: '',
    origin: '',
    params: {},
  };
}

/**
 * Handle history navigation
 * On native, this is a no-op stub
 */
export function navigateBack(): void {
  console.warn('navigateBack not implemented for native. Use navigation.goBack() instead.');
}

/**
 * Scroll to an element by ID
 * On native, this is a no-op stub
 */
export function scrollToElement(
  elementId: string, 
  options?: { behavior?: 'auto' | 'smooth'; block?: 'start' | 'center' | 'end' | 'nearest' }
): void {
  console.warn('scrollToElement not implemented for native platforms');
}

/**
 * Prefetch a route or resource
 * On native, this is a no-op stub
 */
export function prefetchRoute(url: string): void {
  // No-op for native
}

/**
 * Convert a route path to a breadcrumb array
 * Simplified version for native that just returns an empty array
 */
export function pathToBreadcrumbs(
  path: string,
  routeMap: Record<string, { title: string; path: string }>
): Array<{ title: string; path: string }> {
  return [];
} 