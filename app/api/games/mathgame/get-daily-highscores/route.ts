import { NextResponse } from "next/server";
import {
  getDailyTopScores,
  Highscore,
} from "@/server/services/mathgameHighscoreService";

export async function GET() {
  const result: Highscore[] | null = await getDailyTopScores();
  if (!result) {
    return NextResponse.json({ error: result }, { status: 500 });
  }

  return NextResponse.json({ result }, { status: 200 });
}
