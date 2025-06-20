import { Difficulty, Operator } from "../../types/math";
import { DifficultyState } from "./DifficultyState";

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
