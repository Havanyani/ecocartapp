// Simple replacement for nanoid/non-secure
// This is a simplified version of the non-secure random ID generator

const urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

/**
 * Generates a non-secure random ID using the specified alphabet
 * @param size The length of the ID to generate (default: 21)
 * @returns A random string of the specified length
 */
export const customNonSecure = (size = 21): string => {
  let id = '';
  let i: number = size;
  while (i--) {
    id += urlAlphabet[(Math.random() * 64) | 0];
  }
  return id;
};

export default customNonSecure;
