import { supabaseServerClient } from "@/lib/supabase/supabaseServerClient";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";
import "server-only";

export default async function SettingsPage() {
  const {
    data: { session },
  } = await supabaseServerClient.auth.getSession();

  if (!session) redirect("/login");

  const { data: user, error: error } = await supabaseServerClient
    .from("user_profile")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error("Fehler beim Abrufen des Benutzers:", error);
  }

  return <SettingsForm user={user} />;
}
