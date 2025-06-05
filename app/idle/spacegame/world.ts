import { supabaseLocal } from "@/lib/supabase/supabase";
import { generateGalaxy } from "@/lib/galaxy/galaxy";
import { v4 as uuidv4 } from "uuid";

export async function loadWorld(userId: string) {
  // 1. Spielstand holen
  let { data: game } = await supabaseLocal
    .from("idle_space_game")
    .select("*")
    .eq("id", userId)
    .single();

  // Wenn kein Spielstand vorhanden → alles neu erstellen
  if (!game) {
    const seedValue = `SEED-${Math.floor(Math.random() * 100000)}`;
    const seedId = uuidv4();
    const worldId = uuidv4();

    console.log("INSERTING", { userId, worldId, seedId });

    // a) Seed speichern
    const { error: insertError } = await supabaseLocal
      .from("idle_space_game_seed")
      .insert({ id: seedId, value: seedValue });

    if (insertError) {
      console.error("Insert failed:", insertError);
    }

    // b) Welt speichern
    const { error: worldErr } = await supabaseLocal
      .from("idle_space_game_world")
      .insert({ id: worldId, player_id: userId, seed_id: seedId });

    // c) Spielstand speichern
    const { error: gameErr } = await supabaseLocal
      .from("idle_space_game")
      .insert({
        id: userId,
        world_id: worldId,
        current_pos: { x: 500, y: 300 },
      });

    // d) Spielstand neu laden
    const { data: gameReloaded } = await supabaseLocal
      .from("idle_space_game")
      .select("*")
      .eq("id", userId)
      .single();

    game = gameReloaded;
  }

  // 2. Welt & Seed holen
  const { data: world } = await supabaseLocal
    .from("idle_space_game_world")
    .select("*")
    .eq("id", game.world_id)
    .single();

  const { data: seedData } = await supabaseLocal
    .from("idle_space_game_seed")
    .select("*")
    .eq("id", world.seed_id)
    .single();

  // 3. Ressourcen laden
  const { data: resources } = await supabaseLocal
    .from("idle_space_game_resources")
    .select("*");

  // 4. Galaxy generieren
  const worldData = generateGalaxy(seedData.value, resources || []);
  return {
    world: worldData,
    game, // enthält current_pos & world_id
  };
}
