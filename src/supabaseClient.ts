import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  // Surface a clear error instead of a cryptic client failure — this almost
  // always means the env vars weren't set (locally in .env.local, or in the
  // Cloudflare Pages project settings).
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Set them in .env.local (dev) ' +
      'or in your Cloudflare Pages project environment variables (production).',
  )
}

// Fall back to a syntactically valid placeholder so createClient doesn't
// throw at import time — the app renders a clear "not configured" banner
// instead of a blank crashed page (see isSupabaseConfigured above).
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)
