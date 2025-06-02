import MathGame from "../components/MathGame/MathGame";
import { createSupabaseServerClient } from "../lib/supabase/supabaseServerClient";

export default async function MathGamePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MathGame  />
    </main>
  );
}
