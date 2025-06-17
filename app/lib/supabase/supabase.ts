import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabaseLocal = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // oder anon key – je nach Kontext
  {
    global: {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, // oder anon key
      },
    },
  }
);
