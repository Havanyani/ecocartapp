/**
 * A simple utility to generate unique IDs for use throughout the application
 * This implementation mimics the functionality of the nanoid package
 */

// Function to generate a random ID with specified length
export function generateUniqueId(length: number = 21): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  
  // Create a Uint8Array of the desired length to store random values
  const bytes = new Uint8Array(length);
  
  // Fill with cryptographically secure random values if available, otherwise use Math.random
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback to Math.random (less secure but works everywhere)
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  
  // Convert random bytes to characters from our alphabet
  for (let i = 0; i < length; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  
  return id;
}

// Generate a timestamp-based ID for situations where order matters
export function generateTimestampedId(): string {
  const timestamp = Date.now().toString(36); // Convert timestamp to base36
  const randomSuffix = generateUniqueId(8); // Add random suffix for uniqueness
  return `${timestamp}-${randomSuffix}`;
}

// Generate a sequential ID with a random component
// Useful for ordered lists that need unique, non-overlapping IDs
let counter = 0;
export function generateSequentialId(prefix: string = ''): string {
  const sequence = (counter++).toString(36).padStart(4, '0');
  const random = generateUniqueId(6);
  return `${prefix}${sequence}-${random}`;
} 