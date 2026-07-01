import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con SERVICE_ROLE_KEY.
 * Bypassa RLS — usar SOLO en Server Components o Server Actions de admin.
 * NUNCA exponer en el cliente (browser).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
