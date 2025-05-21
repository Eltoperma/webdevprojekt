import { supabaseComponentClient } from "@/lib/supabase/supabaseComponentClient";
import { supabaseServerClient } from "@/lib/supabase/supabaseServerClient";
import { redirect } from "next/navigation";
import { User } from "@/types/user";

/* Hier wird der Supabase-Auth-Client verwendet, um die Einstellungen des Benutzers anzuzeigen.
 */
export default async function SettingsPage() {
  const {
    data: { session: userSession },
  } = await supabaseServerClient.auth.getSession();

  if (!userSession) redirect("/login");

  // @todo Query mit Prisma ersetzen?
  // Hier wird mittels der Supabase-Session-ID des Benutzers die Tabelle "user" abgefragt, um die Profildaten zu erhalten.
  const { data, error } = await supabaseComponentClient
    .from("user")
    .select("*")
    .eq("auth_user_id", userSession?.user.id)
    .single();

  if (error) {
    console.error("Error fetching user data:", error);
    return;
  }

  const user = data as User;
  console.log("User data:", user);

  // Hier werden relevante Eckdaten für den User angezeigt. Das Datum "created_at" wird auf die ersten 10 Zeichen gekürzt, um nur das Datum anzuzeigen.
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold center">Einstellungen</h1>
      <p>Username: {user.name} </p>
      <p>Mitglied seit: {user.created_at?.slice(0, 10)} </p>
    </div>
  );
}
