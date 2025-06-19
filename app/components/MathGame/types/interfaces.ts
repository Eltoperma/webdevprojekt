import { Operator, Difficulty } from "../../types/math";

export interface DifficultyState {
  lives: number;
  previousAttempts: Array<{
    numbers: number[];
    operators: (Operator | null)[];
    result: number;
  }>;
  isCompleted: boolean;
  finalResult?: {
    numbers: number[];
    operators: (Operator | null)[];
    result: number;
  };
  score: number;
  lastUpdate: number;
}

export interface GameState {
  numbers: number[];
  operators: (Operator | null)[];
  result: number | null;
  attempts: number;
  isIntegerResult: boolean;
  difficulty: Difficulty;
  isCorrect: boolean;
  currentGameId: number | null;
  difficultyStates: Record<Difficulty, DifficultyState>;
}

export interface SavedGameState {
  difficultyStates: Record<Difficulty, DifficultyState>;
  difficulty: Difficulty;
  savedDate: string;
}
