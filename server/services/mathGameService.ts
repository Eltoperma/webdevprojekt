import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface MathGame {
  math_game_id: number;
  difficulty: number;
  numbers: number[];
  operators: string[];
  result: number;
}

export interface GameHistory {
  math_game_id: number;
  date: Date;
}

export interface DailyGames {
  easy: MathGame;
  medium: MathGame;
  hard: MathGame;
  expert: MathGame;
}

export async function getDailyGames(): Promise<DailyGames | null> {
  try {
    const today = new Date();
    const cetDate = new Date(
      today.toLocaleString("en-US", { timeZone: "Europe/Berlin" })
    );
    const todayStr = cetDate.toISOString().split("T")[0];

    const { data: gameHistory, error: historyError } = await supabase
      .from("math_game_history")
      .select("math_game_id, date")
      .eq("date", todayStr)
      .single();

    if (historyError) {
      console.error("Error fetching game history:", historyError);
      return null;
    }

    if (!gameHistory) {
      return null;
    }

    const { data: mathGames, error: gamesError } = await supabase
      .from("math_game")
      .select("*")
      .eq("math_game_id", gameHistory.math_game_id);

    if (gamesError) {
      console.error("Error fetching math games:", gamesError);
      return null;
    }

    if (!mathGames || mathGames.length === 0) {
      return null;
    }

    const formattedGames: DailyGames = {
      easy: mathGames.find((game) => game.difficulty === "easy")!,
      medium: mathGames.find((game) => game.difficulty === "medium")!,
      hard: mathGames.find((game) => game.difficulty === "hard")!,
      expert: mathGames.find((game) => game.difficulty === "expert")!,
    };

    if (
      !formattedGames.easy ||
      !formattedGames.medium ||
      !formattedGames.hard ||
      !formattedGames.expert
    ) {
      return null;
    }

    return formattedGames;
  } catch (error) {
    console.error("Unexpected error in getDailyGames:", error);
    return null;
  }
}
