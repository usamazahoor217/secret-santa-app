/**
 * Security utilities for input sanitization and anti-XSS protection.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

const HTML_ESCAPE_REGEX = /[&<>"'`/]/g;

/**
 * Escapes potentially dangerous characters in user-controlled strings to prevent stored/reflected XSS.
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim().replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Strips null bytes, non-printable control characters, and excess whitespace from plain text strings.
 */
export function cleanPlainText(input: unknown, maxLength: number = 2000): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove null characters and non-printable ASCII (except newline and tab)
  const cleaned = input
    .replace(/\0/g, '')
    .replace(/[\x01-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    .trim();

  return cleaned.slice(0, maxLength);
}

/**
 * Validates and normalizes safe URLs (e.g. for wishlists), allowing only http:// and https:// protocols.
 */
export function sanitizeUrl(urlInput: unknown): string | null {
  if (typeof urlInput !== 'string' || !urlInput.trim()) {
    return null;
  }

  const trimmed = urlInput.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}
