import '@testing-library/jest-dom/vitest';
import 'dotenv/config';

process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/secretsanta';

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
