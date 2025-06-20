import { Operator } from "../../types/math";

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
