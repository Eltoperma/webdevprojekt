import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Highscore {
  id: number;
  math_game_history_id: number;
  difficulty: string;
  user_id: string;
  score: number;
  created_at: string;
  user_profile: {
    name: string;
  };
}

export async function getDailyTopScores(
  limit: number = 20
): Promise<Highscore[] | null> {
  try {
    const today = new Date();
    const cetDate = new Date(
      today.toLocaleString("en-US", { timeZone: "Europe/Berlin" })
    );
    const todayStr = cetDate.toISOString().split("T")[0];

    const { data: gameHistory, error: historyError } = await supabase
      .from("math_game_history")
      .select("math_game_id")
      .eq("date", todayStr)
      .single();

    if (historyError || !gameHistory) {
      console.error("Error fetching game history:", historyError);
      return null;
    }

    const { data: highscores, error: highscoreError } = await supabase
      .from("math_game_highscore")
      .select(
        `
        *,
        user_profile:user_id (
          name
        )
      `
      )
      .eq("math_game_history_id", gameHistory.math_game_id)
      .order("score", { ascending: true })
      .limit(limit);

    if (highscoreError) {
      console.error("Error fetching highscores:", highscoreError);
      return null;
    }

    return highscores;
  } catch (error) {
    console.error("Unexpected error in getDailyTopScores:", error);
    return null;
  }
}

export async function getUserScores(
  userId: string
): Promise<Highscore[] | null> {
  try {
    const today = new Date();
    const cetDate = new Date(
      today.toLocaleString("en-US", { timeZone: "Europe/Berlin" })
    );
    const todayStr = cetDate.toISOString().split("T")[0];

    const { data: gameHistory, error: historyError } = await supabase
      .from("math_game_history")
      .select("math_game_id")
      .eq("date", todayStr)
      .single();

    if (historyError || !gameHistory) {
      console.error("Error fetching game history:", historyError);
      return null;
    }

    const { data: highscores, error: highscoreError } = await supabase
      .from("math_game_highscore")
      .select(
        `
        *,
        user_profile:user_id (
          name
        )
      `
      )
      .eq("math_game_history_id", gameHistory.math_game_id)
      .eq("user_id", userId);

    if (highscoreError) {
      console.error("Error fetching user scores:", highscoreError);
      return null;
    }

    return highscores;
  } catch (error) {
    console.error("Unexpected error in getUserScores:", error);
    return null;
  }
}
