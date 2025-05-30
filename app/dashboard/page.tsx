import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServerClient";
import DashboardForm from "./DashboardForm";
import "server-only";

export default async function DashboardPage() {
  const supabaseServerClient = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabaseServerClient.auth.getSession();

  if (!session) redirect("/login");

  const { data: user, error } = await supabaseServerClient
    .from("user_profile")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!user || error) {
    redirect("/login"); // oder Fehler anzeigen
  }

  return <DashboardForm user={user} />;
}
