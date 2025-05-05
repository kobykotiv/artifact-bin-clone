import { validateEnv } from '@/lib/config/env';
// ...existing imports...

if (typeof window !== 'undefined') {
  validateEnv();
}

// ...existing code...