import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://yuzwbejrqxjewwkczuqy.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_ya4AqpC2MYE1dgIb2Rdb4w_MM4IPL0h"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)