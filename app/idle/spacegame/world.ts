import { supabase } from "@/lib/supabase/supabase";
import { generateGalaxy } from "@/lib/galaxy/galaxy";

export async function loadWorld(userId: string) {
  // Hole Spielstand + Seed
  const { data: game } = await supabase
    .from("idle_space_game")
    .select("*")
    .eq("id", userId)
    .single();

  // Hole Ressourcen
  const { data: resources } = await supabase
    .from("idle_space_game_resources")
    .select("*");

  const world = generateGalaxy(game.seed, resources || []);
  return { world, game };
}
