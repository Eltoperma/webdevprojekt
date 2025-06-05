// app/idle/spacegame/page.tsx
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServerClient";
import ClientGame from "./ClientGame";
import { redirect } from "next/navigation";
import "server-only";
import { loadWorld } from "./world";

export default async function SpaceGamePage() {
  const supabaseServerClient = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabaseServerClient.auth.getSession();

  if (!session?.user.id) {
    redirect("/login");
  }

  const { world, game } = await loadWorld(session.user.id);

  return <ClientGame userId={session.user.id} world={world} game={game} />;
}
