import { createSupabaseServerClient } from "@/app/lib/supabase/supabaseServerClient";

export async function getUsername() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profile")
    .select("name")
    .eq("id", user.id)
    .single();

  if (error || !data?.name) return null;

  return data.name;
}
