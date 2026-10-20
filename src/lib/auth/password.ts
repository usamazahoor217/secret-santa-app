import { randomBytes, scrypt, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const SCRYPT_OPTIONS = {
  N: 16384, // CPU/memory cost
  r: 8,     // Block size
  p: 1,     // Parallelization
  maxmem: 32 * 1024 * 1024,
};

function deriveKey(password: string, salt: Buffer, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, SCRYPT_OPTIONS, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
}

/**
 * Hashes a plain-text password using cryptographically secure scrypt with a unique 16-byte salt.
 * Returns formatted string: `${saltHex}:${hashHex}`
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string.');
  }

  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await deriveKey(password, salt, KEY_LENGTH);

  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plain-text password against a stored scrypt hash using timingSafeEqual to prevent side-channel timing attacks.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (!password || !storedHash || typeof password !== 'string' || typeof storedHash !== 'string') {
    return false;
  }

  const [saltHex, originalHashHex] = storedHash.split(':');
  if (!saltHex || !originalHashHex) {
    return false;
  }

  try {
    const salt = Buffer.from(saltHex, 'hex');
    const originalHash = Buffer.from(originalHashHex, 'hex');

    const derivedKey = await deriveKey(password, salt, originalHash.length);

    return timingSafeEqual(originalHash, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Generates an unguessable cryptographically secure random token (e.g. for organizer or magic links).
 */
export function generateSecureToken(byteLength: number = 32): string {
  return randomBytes(byteLength).toString('hex');
}

/**
 * Compares two tokens in constant time to prevent timing attacks.
 */
export function timingSafeTokenEqual(tokenA: string, tokenB: string): boolean {
  if (typeof tokenA !== 'string' || typeof tokenB !== 'string') {
    return false;
  }

  const bufA = Buffer.from(tokenA);
  const bufB = Buffer.from(tokenB);

  if (bufA.length !== bufB.length) {
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}
