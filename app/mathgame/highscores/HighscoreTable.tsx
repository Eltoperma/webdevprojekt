'use client';

import { useState } from 'react';

interface Highscore {
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

interface HighscoreTableProps {
  initialScores: Highscore[] | null;
  userScores?: Highscore[] | null;
  loggedInUserId?: string;
}

const difficulties = ['easy', 'medium', 'hard', 'expert'];

export default function HighscoreTable({ initialScores, userScores, loggedInUserId }: HighscoreTableProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('easy');

  const filteredScores = initialScores?.filter(
    (score) => score.difficulty === selectedDifficulty
  ) || [];

  // Find the user's best score for this difficulty (lowest score)
  let userBest: Highscore | undefined = undefined;
  if (userScores && loggedInUserId) {
    userBest = userScores
      .filter((score) => score.difficulty === selectedDifficulty)
      .sort((a, b) => a.score - b.score)[0];
  }

  // Check if user's best score is already in the top 20
  const userInTop = userBest && filteredScores.some((s) => s.id === userBest!.id);

  // If not, calculate the user's rank and append as the last row
  let displayScores = filteredScores;
  let userRank: number | undefined = undefined;
  if (userBest && !userInTop) {
    // Calculate the user's rank among all scores for this difficulty
    const allScores = [...filteredScores, userBest]
      .sort((a, b) => a.score - b.score);
    userRank = allScores.findIndex((s) => s.id === userBest!.id) + 1;
    // Show top 19 + userBest as 20th row
    displayScores = [
      ...filteredScores.slice(0, 19),
      { ...userBest },
    ];
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => setSelectedDifficulty(difficulty)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors
              ${
                selectedDifficulty === difficulty
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            {difficulty}
          </button>
        ))}
      </div>

      {displayScores && displayScores.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {displayScores.map((score, index) => {
                // Calculate rank
                let rank = index + 1;
                if (userBest && !userInTop && index === 19 && userRank) {
                  rank = userRank;
                }
                // Highlight if this is the logged-in user
                const isUser = loggedInUserId && score.user_id === loggedInUserId;
                return (
                  <tr
                    key={`${score.id}-${score.user_id}-${score.created_at}`}
                    className={
                      isUser
                        ? 'bg-green-100 dark:bg-green-800'
                        : ''
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {score.user_profile.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {score.score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">No highscores available for {selectedDifficulty} difficulty.</p>
      )}
    </div>
  );
} 