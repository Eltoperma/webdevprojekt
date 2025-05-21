import { redirect } from "next/navigation";
import { supabaseServerClient } from "@/lib/supabase/supabaseServerClient";

/* Hier wird der Supabase-Auth-Client verwendet, um das Dashboard des Benutzers anzuzeigen.
 */
// @todo Spiel-Highscore und Spiel-Statistiken anzeigen
export default async function DashboardPage() {
  const {
    data: { session },
  } = await supabaseServerClient.auth.getSession();

  if (!session) redirect("/login");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold center">Dein Dashboard</h1>
      <p>Hallo {session.user.email}</p>
    </div>
  );
}
