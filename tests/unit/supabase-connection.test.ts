import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/admin';

describe('Supabase Client & Database Connection Setup', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-jwt-token',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-jwt-token',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('initializes the browser Supabase client when required environment variables are set', () => {
    const client = createBrowserClient();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe('function');
    expect(typeof client.auth.signUp).toBe('function');
  });

  it('throws a descriptive error when NEXT_PUBLIC_SUPABASE_URL is missing in browser client', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    expect(() => createBrowserClient()).toThrow(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  });

  it('throws a descriptive error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in browser client', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createBrowserClient()).toThrow(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  });

  it('initializes the privileged admin client when service role key is present', () => {
    const admin = createAdminClient();
    expect(admin).toBeDefined();
    expect(typeof admin.from).toBe('function');
    expect(typeof admin.auth.admin).toBe('object');
  });

  it('throws an error if SUPABASE_SERVICE_ROLE_KEY is missing for admin operations', () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => createAdminClient()).toThrow(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  });

  it('correctly constructs queries for core tables (profiles, events, participants)', () => {
    const client = createBrowserClient();

    const profilesQuery = client.from('profiles').select('id, email, full_name');
    expect(profilesQuery).toBeDefined();

    const eventsQuery = client.from('events').select('*').eq('status', 'draft');
    expect(eventsQuery).toBeDefined();

    const participantsQuery = client.from('participants').select('*');
    expect(participantsQuery).toBeDefined();

    const assignmentsQuery = client.from('assignments').select('id, giver_id, receiver_id');
    expect(assignmentsQuery).toBeDefined();
  });
});
