import { describe, it, expect } from 'vitest';
import { sanitizeString, cleanPlainText, sanitizeUrl } from '@/lib/sanitization';

describe('Sanitization & Security Utilities', () => {
  it('escapes dangerous HTML/XSS characters in strings', () => {
    const raw = '<script>alert("xss")</script><img src="x" onerror="steal()"/>';
    const clean = sanitizeString(raw);

    expect(clean).not.toContain('<script>');
    expect(clean).toContain('&lt;script&gt;');
    expect(clean).toContain('&quot;xss&quot;');
    expect(clean).toContain('&#x2F;script&gt;');
  });

  it('handles null, non-strings and edge cases gracefully in sanitizeString', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(12345)).toBe('');
    expect(sanitizeString('   normal text   ')).toBe('normal text');
  });

  it('cleans non-printable ASCII and null bytes in cleanPlainText', () => {
    const rawWithNulls = 'Hello\0 World\x07\x08!';
    const cleaned = cleanPlainText(rawWithNulls);

    expect(cleaned).toBe('Hello World!');
  });

  it('truncates excess length safely in cleanPlainText', () => {
    const longString = 'a'.repeat(3000);
    const cleaned = cleanPlainText(longString, 500);

    expect(cleaned).toHaveLength(500);
  });

  it('validates safe URLs and rejects javascript: or data: URIs', () => {
    expect(sanitizeUrl('https://amazon.com/dp/12345')).toBe('https://amazon.com/dp/12345');
    expect(sanitizeUrl('http://example.org/gift')).toBe('http://example.org/gift');
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(sanitizeUrl('ftp://invalidscheme.com')).toBeNull();
    expect(sanitizeUrl('not a url')).toBeNull();
  });
});
