// app/idle/spacegame/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServerClient";
import ClientGame from "./ClientGame";
import { redirect } from "next/navigation";

export default async function SpaceGamePage() {
  const supabaseServerClient = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabaseServerClient.auth.getSession();

  if (!session?.user.id) {
    redirect("/login");
  }

  return <ClientGame userId={session.user.id} />;
}
