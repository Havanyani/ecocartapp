/**
 * numberUtils.ts
 * 
 * Utility functions for formatting and calculating numbers
 */

/**
 * Formats a number with the specified number of decimal places
 * and adds appropriate suffixes for large numbers (K, M, B)
 * 
 * @param num The number to format
 * @param decimals The number of decimal places to include
 * @param useSuffix Whether to use K/M/B suffixes for large numbers
 * @returns Formatted number string
 */
export function formatNumber(num: number, decimals: number = 1, useSuffix: boolean = true): string {
  if (isNaN(num) || num === null) return '0';
  
  if (num === 0) return '0';
  
  if (!useSuffix) return num.toFixed(decimals);
  
  // For numbers less than 1000, return with specified decimal places
  if (Math.abs(num) < 1000) {
    // For small values, don't show trailing zeros
    if (Math.abs(num) < 10 && decimals > 1) {
      return num.toFixed(decimals).replace(/\.?0+$/, '');
    }
    return num.toFixed(decimals);
  }
  
  // For larger numbers, use K, M, B suffixes
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixIndex = Math.floor(Math.log10(Math.abs(num)) / 3);
  
  const shortNum = num / Math.pow(1000, suffixIndex);
  const suffix = suffixes[suffixIndex];
  
  // For values like 1.0K, remove the decimal
  if (Number.isInteger(shortNum)) {
    return `${shortNum.toFixed(0)}${suffix}`;
  }
  
  return `${shortNum.toFixed(decimals)}${suffix}`;
}

/**
 * Calculates the percentage of a value relative to a total
 * 
 * @param value The value to calculate percentage for
 * @param total The total value
 * @param decimals The number of decimal places to include
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, total: number, decimals: number = 0): string {
  if (total === 0 || isNaN(total) || isNaN(value)) return '0%';
  
  const percent = (value / total) * 100;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Formats a currency value based on locale and currency code
 * 
 * @param amount The amount to format
 * @param currencyCode The ISO currency code (e.g., 'USD', 'EUR')
 * @param locale The locale to use for formatting
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback format if Intl is not supported
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
    };
    
    const symbol = symbols[currencyCode] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Clamps a number between min and max values
 * 
 * @param num The number to clamp
 * @param min The minimum allowed value
 * @param max The maximum allowed value
 * @returns The clamped number
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Calculates the average of an array of numbers
 * 
 * @param numbers Array of numbers to average
 * @returns The average value
 */
export function average(numbers: number[]): number {
  if (!numbers.length) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Rounds a number to the nearest multiple of another number
 * 
 * @param value The value to round
 * @param multiple The multiple to round to
 * @returns The rounded value
 */
export function roundToNearest(value: number, multiple: number): number {
  return Math.round(value / multiple) * multiple;
} 