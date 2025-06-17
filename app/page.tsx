// app/page.tsx (Server Component)
import { createSupabaseServerClient } from "@/app/lib/supabase/supabaseServerClient";
import LandingPageContent from "./LandingPageContent";
import "server-only";

export default async function Home() {
  const supabaseServerClient = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabaseServerClient.auth.getSession();

  return <LandingPageContent session={session} />;
}
