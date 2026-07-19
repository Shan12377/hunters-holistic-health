// Shared fetch headers for authenticated API calls.
// Every /api/ endpoint that spends money requires the Supabase Bearer token
// (see CLAUDE.md, API Endpoint Auth Rule).

import { supabase } from '@/lib/supabase'

export async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token ?? ''}`,
  }
}
