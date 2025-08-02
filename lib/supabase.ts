import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client
export const createServerClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export type Mod = {
  id: string
  title: string
  description: string | null
  author: string
  version: string
  category: string
  file_url: string
  file_name: string
  file_size: number | null
  download_count: number
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  description: string | null
  created_at: string
}
