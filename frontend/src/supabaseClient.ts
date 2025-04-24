import { createClient } from '@supabase/supabase-js'

// 2024-01-09: 添加类型声明以解决 TypeScript 错误
declare global {
  interface ImportMeta {
    env: {
      VITE_SUPABASE_URL: string
      VITE_SUPABASE_ANON_KEY: string
    }
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
