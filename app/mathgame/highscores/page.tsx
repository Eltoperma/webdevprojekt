import { createSupabaseServerClient } from "@/app/lib/supabase/supabaseServerClient";
import { getDailyTopScores, getUserScores } from "@/server/services/mathgameHighscoreService";
import HighscoreTable from "./HighscoreTable";

export default async function HighscoresPage() {
  const supabaseServerClient = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabaseServerClient.auth.getSession();

  let userScores = null;
  let dailyScores = await getDailyTopScores();
  
  if (session?.user) {
    userScores = await getUserScores(session.user.id);
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Math Game Highscores</h1>
        <HighscoreTable initialScores={dailyScores} userScores={userScores} loggedInUserId={session?.user?.id} />
      </div>
    </main>
  );
} 