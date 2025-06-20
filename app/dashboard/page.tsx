import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabase/supabaseServerClient";
import DashboardForm from "./DashboardForm";
import "server-only";

export default async function DashboardPage() {
  const supabaseServerClient = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabaseServerClient.auth.getSession();

  if (!session) redirect("/login?redirect=/dashboard");

  const { data: user, error } = await supabaseServerClient
    .from("user_profile")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  return <DashboardForm user={user} />;
}
