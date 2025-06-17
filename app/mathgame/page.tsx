import MathGame from "../components/MathGame/MathGame";
import { createSupabaseServerClient } from "../lib/supabase/supabaseServerClient";

export default async function MathGamePage() {
  const supabaseServerClient = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabaseServerClient.auth.getSession();

  let user = null;
  
  if (session) {
    const { data, error } = await supabaseServerClient
      .from("user_profile")
      .select("*")
      .eq("id", session.user.id)
      .single();
    
    if (!error) {
      user = data;
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MathGame user={user} />
    </main>
  );
}
