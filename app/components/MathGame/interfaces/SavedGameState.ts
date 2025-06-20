import { Difficulty } from "../../types/math";
import { DifficultyState } from "./DifficultyState";

export interface SavedGameState {
  difficultyStates: Record<Difficulty, DifficultyState>;
  difficulty: Difficulty;
  savedDate: string;
}
