import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  timingSafeTokenEqual,
} from '@/lib/auth/password';

describe('Password & Authentication Security Utilities', () => {
  it('correctly hashes passwords with unique salts', async () => {
    const password = 'SuperSecretFestivePassword!2026';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).toBeDefined();
    expect(hash2).toBeDefined();
    // Unique salt guarantees hash1 != hash2 even for the exact same password
    expect(hash1).not.toBe(hash2);
    expect(hash1).toContain(':');
  });

  it('verifies valid passwords correctly', async () => {
    const password = 'HolidayJoySecure#99';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('rejects incorrect passwords', async () => {
    const password = 'HolidayJoySecure#99';
    const hash = await hashPassword(password);

    const isInvalid = await verifyPassword('WrongPassword123', hash);
    expect(isInvalid).toBe(false);
  });

  it('handles malformed hashes gracefully without throwing exceptions', async () => {
    expect(await verifyPassword('test', 'invalid-hash')).toBe(false);
    expect(await verifyPassword('test', '')).toBe(false);
    expect(await verifyPassword('', 'salt:hash')).toBe(false);
  });

  it('generates secure tokens of expected length', () => {
    const token = generateSecureToken(32);
    expect(token).toHaveLength(64); // 32 bytes in hex = 64 characters
    expect(generateSecureToken()).not.toBe(generateSecureToken());
  });

  it('compares tokens safely in constant time', () => {
    const token = 'abcdef123456';
    expect(timingSafeTokenEqual(token, 'abcdef123456')).toBe(true);
    expect(timingSafeTokenEqual(token, 'different')).toBe(false);
    expect(timingSafeTokenEqual(token, 'abcdef123457')).toBe(false);
  });
});
