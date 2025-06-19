import { supabaseLocal } from "@/app/lib/supabase/supabase";
import { generateGalaxy } from "@/app/lib/galaxy/galaxy";
import { v4 as uuidv4 } from "uuid";
import { IdleGameWorld } from "@/app/lib/galaxy/galaxyTypes";

export async function loadWorld(userId: string) {
  // 1. Spielstand holen
  let { data: game, error: fetchGameErr } = await supabaseLocal
    .from("idle_space_game")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchGameErr) {
    console.error("Fetch Game failed:", fetchGameErr);
  }

  // Wenn kein Spiel vorhanden: neu erstellen
  if (!game) {
    const seedValue = `SEED-${Math.floor(Math.random() * 100000)}`;
    const seedId = uuidv4();

    console.log("📦 Neues Spiel wird erstellt für User:", userId);

    // a) Spielstand anlegen (noch ohne world_id)
    const { error: gameInsertErr } = await supabaseLocal
      .from("idle_space_game")
      .insert({
        id: userId,
        current_chunk: { x: 0, y: 0 },
      });

    if (gameInsertErr) {
      console.error("❌ Insert idle_space_game fehlgeschlagen:", gameInsertErr);
      throw new Error("Spielstand konnte nicht erstellt werden.");
    }

    // b) Seed speichern
    const { error: seedErr } = await supabaseLocal
      .from("idle_space_game_seed")
      .insert({ id: seedId, value: seedValue });

    if (seedErr) {
      console.error("❌ Insert idle_space_game_seed fehlgeschlagen:", seedErr);
      throw new Error("Seed konnte nicht gespeichert werden.");
    }

    // c) Welt speichern
    const { data: insertedWorld, error: worldErr } = await supabaseLocal
      .from("idle_space_game_world")
      .insert({ player_id: userId, seed_id: seedId })
      .select("id")
      .single();

    if (worldErr || !insertedWorld) {
      console.error(
        "❌ Insert idle_space_game_world fehlgeschlagen:",
        worldErr
      );
      throw new Error("Welt konnte nicht gespeichert werden.");
    }

    // d) Spieler aktualisieren mit world_id
    const { error: updateErr } = await supabaseLocal
      .from("idle_space_game")
      .update({ world_id: insertedWorld.id })
      .eq("id", userId);

    if (updateErr) {
      console.error(
        "❌ Update world_id im Spielstand fehlgeschlagen:",
        updateErr
      );
    }

    // e) Reload game
    const { data: gameReloaded, error: reloadErr } = await supabaseLocal
      .from("idle_space_game")
      .select("*")
      .eq("id", userId)
      .single();

    if (reloadErr) {
      console.error("❌ Spielstand reload fehlgeschlagen:", reloadErr);
      throw new Error(
        "Spielstand konnte nach Erstellung nicht geladen werden."
      );
    }

    game = gameReloaded;
  }

  // 2. Welt & Seed holen
  const { data: world, error: worldFetchErr } = await supabaseLocal
    .from("idle_space_game_world")
    .select("*")
    .eq("id", game.world_id)
    .single();

  if (worldFetchErr) {
    console.error("❌ Welt konnte nicht geladen werden:", worldFetchErr);
    throw new Error("Fehler beim Laden der Welt.");
  }

  const { data: seedData, error: seedFetchErr } = await supabaseLocal
    .from("idle_space_game_seed")
    .select("*")
    .eq("id", world.seed_id)
    .single();

  if (seedFetchErr) {
    console.error("❌ Seed konnte nicht geladen werden:", seedFetchErr);
    throw new Error("Fehler beim Laden des Seeds.");
  }

  // 3. Ressourcen laden
  const { data: resources, error: resErr } = await supabaseLocal
    .from("idle_space_game_resources")
    .select("*");

  if (resErr) {
    console.error("❌ Ressourcen konnten nicht geladen werden:", resErr);
    throw new Error("Fehler beim Laden der Ressourcen.");
  }

  // 4. Galaxy generieren
  const worldData: IdleGameWorld = {
    id: world.id,
    seed: seedData.value,
    entities: generateGalaxy(seedData.value, resources || []),
  };

  console.log("🌌 Welt generiert:", seedData);

  return {
    world: worldData,
    game,
  };
}
