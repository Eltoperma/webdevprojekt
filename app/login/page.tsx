import { createSupabaseServerClient } from "@/app/lib/supabase/supabaseServerClient";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm"; // neue Client-Komponente

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
