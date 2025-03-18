/**
 * Calculates Jaccard similarity coefficient between two strings
 * The Jaccard similarity is the size of the intersection divided by the size of the union of the word sets
 * @param str1 First string to compare
 * @param str2 Second string to compare
 * @returns Similarity value between 0 and 1, where 1 means identical
 */
export function calculateJaccardSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (!str1 || !str2) return 0;
  
  // Convert strings to word sets
  const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 0));
  const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 0));
  
  // Count words in intersection
  let intersectionSize = 0;
  for (const word of words1) {
    if (words2.has(word)) {
      intersectionSize++;
    }
  }
  
  // Calculate union size (A ∪ B = |A| + |B| - |A ∩ B|)
  const unionSize = words1.size + words2.size - intersectionSize;
  
  // Return Jaccard similarity coefficient
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

/**
 * Calculates Levenshtein (edit distance) similarity between two strings
 * Normalized to return a value between 0 and 1
 * @param str1 First string to compare
 * @param str2 Second string to compare
 * @returns Similarity value between 0 and 1, where 1 means identical
 */
export function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (!str1 || !str2) return 0;
  
  // Initialize the matrix
  const matrix: number[][] = [];
  
  // Initialize first row
  for (let i = 0; i <= str2.length; i++) {
    matrix[0] = matrix[0] || [];
    matrix[0][i] = i;
  }
  
  // Initialize first column
  for (let i = 0; i <= str1.length; i++) {
    matrix[i] = matrix[i] || [];
    matrix[i][0] = i;
  }
  
  // Fill the matrix
  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,         // deletion
        matrix[i][j - 1] + 1,         // insertion
        matrix[i - 1][j - 1] + cost   // substitution
      );
    }
  }
  
  // Get the final edit distance
  const distance = matrix[str1.length][str2.length];
  
  // Normalize to a similarity score between 0 and 1
  // using the length of the longer string as the normalizing factor
  const maxLength = Math.max(str1.length, str2.length);
  
  // Return normalized similarity (1 - normalized distance)
  return maxLength === 0 ? 1 : 1 - (distance / maxLength);
}

/**
 * Calculates a combined similarity score using multiple algorithms
 * @param str1 First string to compare
 * @param str2 Second string to compare
 * @returns Combined similarity value between 0 and 1
 */
export function calculateCombinedSimilarity(str1: string, str2: string): number {
  // Get direct match first
  if (str1 === str2) return 1;
  if (!str1 || !str2) return 0;
  
  // For short strings, Levenshtein tends to work better
  if (str1.length < 10 || str2.length < 10) {
    return calculateLevenshteinSimilarity(str1, str2);
  }
  
  // For longer text, use a weighted average of both methods
  const jaccardScore = calculateJaccardSimilarity(str1, str2);
  const levenshteinScore = calculateLevenshteinSimilarity(str1, str2);
  
  // Weighted average - give more weight to Jaccard for longer text
  return (jaccardScore * 0.7) + (levenshteinScore * 0.3);
} 