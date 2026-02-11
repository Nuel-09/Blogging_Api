/**
 * Calculate reading time in minutes based on content length
 * Uses average reading speed of 200 words per minute
 * Rounds up to ensure minimum 1 minute
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  // Ensure minimum 1 minute reading time
  return Math.max(1, readingTime);
}
