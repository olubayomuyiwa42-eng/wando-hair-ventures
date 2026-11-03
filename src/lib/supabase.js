import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

export async function uploadPublicImage(file, folder = 'catalog') {
  if (!supabase) throw new Error('Connect Supabase before uploading images.')
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${folder}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('site-assets').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  return supabase.storage.from('site-assets').getPublicUrl(path).data.publicUrl
}
