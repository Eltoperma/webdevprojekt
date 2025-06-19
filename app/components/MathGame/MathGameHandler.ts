import { Operator, Difficulty } from "../types/math";
import {
  getDailyGames,
  DailyGames,
  saveHighscore,
} from "../../../server/services/mathGameService";
import { supabaseBrowserClient } from "../../lib/supabase/supabaseComponentClient";

interface DifficultyState {
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

interface GameState {
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

interface SavedGameState {
  difficultyStates: Record<Difficulty, DifficultyState>;
  difficulty: Difficulty;
  savedDate: string;
}

export class MathGameHandler {
  private gameState: GameState;
  private dailyGames: DailyGames | null = null;
  private readonly STORAGE_KEY = "mathGameState";
  private userId: string | null = null;

  constructor(userId: string | null = null) {
    this.gameState = this.getDefaultState();
    this.userId = userId;
  }

  private getDefaultState(): GameState {
    const now = Date.now();
    return {
      numbers: [],
      operators: [null, null, null, null],
      result: null,
      attempts: 0,
      isIntegerResult: true,
      difficulty: 1 as Difficulty,
      isCorrect: false,
      currentGameId: null,
      difficultyStates: {
        1: {
          lives: 3,
          previousAttempts: [],
          isCompleted: false,
          score: 0,
          lastUpdate: now,
        },
        2: {
          lives: 3,
          previousAttempts: [],
          isCompleted: false,
          score: 0,
          lastUpdate: now,
        },
        3: {
          lives: 3,
          previousAttempts: [],
          isCompleted: false,
          score: 0,
          lastUpdate: now,
        },
        4: {
          lives: 3,
          previousAttempts: [],
          isCompleted: false,
          score: 0,
          lastUpdate: now,
        },
      },
    };
  }

  public loadSavedStateFromClient(): void {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState) as SavedGameState;
          const savedDate = new Date(parsedState.savedDate);
          const currentDate = new Date();
          const isToday =
            savedDate.getDate() === currentDate.getDate() &&
            savedDate.getMonth() === currentDate.getMonth() &&
            savedDate.getFullYear() === currentDate.getFullYear();
          if (isToday) {
            const now = Date.now();
            const updatedDifficultyStates = { ...parsedState.difficultyStates };
            Object.keys(updatedDifficultyStates).forEach((difficulty) => {
              const state =
                updatedDifficultyStates[difficulty as unknown as Difficulty];
              if (!state.isCompleted && state.lives > 0) {
                const timeSinceLastUpdate = now - state.lastUpdate;
                const additionalScore = Math.floor(timeSinceLastUpdate / 1000);
                state.score += additionalScore;
                state.lastUpdate = now;
              }
            });
            const currentDifficultyState =
              updatedDifficultyStates[parsedState.difficulty];
            this.gameState = {
              numbers: [],
              operators: currentDifficultyState.isCompleted
                ? currentDifficultyState.finalResult?.operators || [
                    null,
                    null,
                    null,
                    null,
                  ]
                : [null, null, null, null],
              result: currentDifficultyState.isCompleted
                ? currentDifficultyState.finalResult?.result || null
                : null,
              isCorrect: currentDifficultyState.isCompleted,
              currentGameId: null,
              difficulty: parsedState.difficulty,
              attempts: 0,
              isIntegerResult: true,
              difficultyStates: updatedDifficultyStates,
            };
            return;
          }
        } catch (e) {
          console.error("Failed to parse saved game state:", e);
        }
      }
    }
    // If no valid saved state, reset to default
    this.gameState = this.getDefaultState();
  }

  public calculateResult(
    numbers: number[],
    operators: Operator[]
  ): { result: number; isInteger: boolean } {
    let result = numbers[0];
    for (let i = 0; i < operators.length; i++) {
      const operator = operators[i];
      const nextNumber = numbers[i + 1];

      switch (operator) {
        case "+":
          result += nextNumber;
          break;
        case "-":
          result -= nextNumber;
          break;
        case "*":
          result *= nextNumber;
          break;
        case "/":
          result = result / nextNumber;
          break;
      }
    }
    return { result, isInteger: Number.isInteger(result) };
  }

  public async initialize(): Promise<void> {
    try {
      const games = await getDailyGames();
      if (!games) {
        throw new Error("No games available for today");
      }
      this.dailyGames = games;
      this.loadCurrentGame();
    } catch (error) {
      throw new Error("Failed to initialize game");
    }
  }

  private loadCurrentGame(): void {
    if (!this.dailyGames) return;

    const currentGame =
      this.dailyGames[this.getDifficultyKey(this.gameState.difficulty)];
    const currentDifficultyState =
      this.gameState.difficultyStates[this.gameState.difficulty];

    this.gameState = {
      ...this.gameState,
      numbers: currentGame.numbers,
      currentGameId: currentGame.math_game_id,
      ...(currentDifficultyState.isCompleted && {
        operators: currentDifficultyState.finalResult?.operators || [
          null,
          null,
          null,
          null,
        ],
        result: currentDifficultyState.finalResult?.result || null,
        isCorrect: true,
      }),
    };
  }

  private getDifficultyKey(difficulty: number): keyof DailyGames {
    switch (difficulty) {
      case 1:
        return "easy";
      case 2:
        return "medium";
      case 3:
        return "hard";
      case 4:
        return "expert";
      default:
        return "easy";
    }
  }

  public getCurrentState() {
    return {
      gameState: this.gameState,
      dailyGames: this.dailyGames,
    };
  }

  public handleOperatorClick(index: number, operator: Operator): void {
    if (index === -1) return;

    if (this.isOperatorUsed(operator)) return;

    const newOperators = [...this.gameState.operators];
    newOperators[index] = operator;

    this.gameState = {
      ...this.gameState,
      operators: newOperators,
      result: null,
      isCorrect: false,
    };
    this.saveState();
  }

  public handleOperatorSelect(operator: Operator): void {
    // Remove keyboard-specific logic
  }

  public handleKeyPress(event: KeyboardEvent): void {
    // Remove all keyboard handling
  }

  public handleDifficultyChange(newDifficulty: Difficulty): void {
    if (!this.dailyGames) return;

    const currentGame = this.dailyGames[this.getDifficultyKey(newDifficulty)];
    const currentDifficultyState =
      this.gameState.difficultyStates[newDifficulty];

    const now = Date.now();
    const updatedDifficultyStates = { ...this.gameState.difficultyStates };

    const currentState = updatedDifficultyStates[this.gameState.difficulty];
    if (!currentState.isCompleted && currentState.lives > 0) {
      const timeSinceLastUpdate = now - currentState.lastUpdate;
      const additionalScore = Math.floor(timeSinceLastUpdate / 1000);
      currentState.score += additionalScore;
      currentState.lastUpdate = now;
    }

    updatedDifficultyStates[newDifficulty] = {
      ...currentDifficultyState,
      lastUpdate: now,
      score: currentDifficultyState.score,
      lives: currentDifficultyState.lives,
      previousAttempts: currentDifficultyState.previousAttempts,
      isCompleted: currentDifficultyState.isCompleted,
      finalResult: currentDifficultyState.finalResult,
    };

    this.gameState = {
      ...this.gameState,
      difficulty: newDifficulty,
      numbers: currentGame.numbers,
      operators: currentDifficultyState.isCompleted
        ? currentDifficultyState.finalResult?.operators || [
            null,
            null,
            null,
            null,
          ]
        : [null, null, null, null],
      result: currentDifficultyState.isCompleted
        ? currentDifficultyState.finalResult?.result || null
        : null,
      currentGameId: currentGame.math_game_id,
      isCorrect: currentDifficultyState.isCompleted,
      difficultyStates: updatedDifficultyStates,
    };

    this.saveState();
  }

  private async saveHighscore(
    difficulty: Difficulty,
    score: number
  ): Promise<void> {
    if (!this.userId || !this.dailyGames) return;

    const difficultyKey = this.getDifficultyKey(difficulty);
    const gameHistoryId = this.dailyGames[difficultyKey].math_game_id;

    const { error } = await saveHighscore(
      gameHistoryId,
      difficultyKey,
      this.userId,
      score
    );

    if (error) {
      console.error("Failed to save highscore:", error);
    }
  }

  public async confirmResult(): Promise<void> {
    if (this.gameState.operators.some((op) => op === null)) return;

    const { result } = this.calculateResult(
      this.gameState.numbers,
      this.gameState.operators as Operator[]
    );
    const isCorrect = this.dailyGames
      ? result ===
        this.dailyGames[this.getDifficultyKey(this.gameState.difficulty)].result
      : false;

    if (isCorrect) {
      const now = Date.now();
      const currentState =
        this.gameState.difficultyStates[this.gameState.difficulty];
      const timeSinceLastUpdate = now - currentState.lastUpdate;
      const additionalScore = Math.floor(timeSinceLastUpdate / 1000);
      const finalScore = currentState.score + additionalScore;

      // Save highscore if user is logged in
      if (this.userId) {
        await this.saveHighscore(this.gameState.difficulty, finalScore);
      }

      const updatedDifficultyStates = {
        ...this.gameState.difficultyStates,
        [this.gameState.difficulty]: {
          ...currentState,
          isCompleted: true,
          score: finalScore,
          lastUpdate: now,
          finalResult: {
            numbers: this.gameState.numbers,
            operators: this.gameState.operators,
            result,
          },
        },
      };

      this.gameState = {
        ...this.gameState,
        result,
        isCorrect: true,
        isIntegerResult: Number.isInteger(result),
        difficultyStates: updatedDifficultyStates,
      };
    } else {
      const currentDifficultyState =
        this.gameState.difficultyStates[this.gameState.difficulty];
      const newLives = currentDifficultyState.lives - 1;
      const scoreMultiplier = 3 - newLives;
      const scoreAddition = 20;

      const now = Date.now();
      const currentState =
        this.gameState.difficultyStates[this.gameState.difficulty];
      const timeSinceLastUpdate = now - currentState.lastUpdate;
      const additionalScore = Math.floor(timeSinceLastUpdate / 1000);
      const currentScore = currentState.score + additionalScore;
      const newScore = currentScore * scoreMultiplier + scoreAddition;

      const updatedDifficultyStates = {
        ...this.gameState.difficultyStates,
        [this.gameState.difficulty]: {
          ...currentState,
          lives: newLives,
          score: newScore,
          lastUpdate: now,
          previousAttempts: [
            ...currentState.previousAttempts,
            {
              numbers: this.gameState.numbers,
              operators: this.gameState.operators,
              result,
            },
          ],
          isCompleted: newLives <= 0,
          ...(newLives <= 0 && {
            finalResult: {
              numbers: this.gameState.numbers,
              operators: this.dailyGames
                ? (this.dailyGames[
                    this.getDifficultyKey(this.gameState.difficulty)
                  ].operators as Operator[])
                : this.gameState.operators,
              result: this.dailyGames
                ? this.dailyGames[
                    this.getDifficultyKey(this.gameState.difficulty)
                  ].result
                : result,
            },
          }),
        },
      };

      this.gameState = {
        ...this.gameState,
        result,
        isIntegerResult: Number.isInteger(result),
        isCorrect,
        difficultyStates: updatedDifficultyStates,
        operators: [null, null, null, null],
        ...(newLives <= 0 &&
          this.dailyGames && {
            operators: this.dailyGames[
              this.getDifficultyKey(this.gameState.difficulty)
            ].operators as Operator[],
            result:
              this.dailyGames[this.getDifficultyKey(this.gameState.difficulty)]
                .result,
            isCorrect: true,
          }),
      };
    }
    this.saveState();
  }

  private isOperatorUsed(operator: Operator): boolean {
    return this.gameState.operators.includes(operator);
  }

  private saveState(): void {
    if (typeof window !== "undefined") {
      const stateToSave: SavedGameState = {
        difficultyStates: this.gameState.difficultyStates,
        difficulty: this.gameState.difficulty,
        savedDate: new Date().toISOString(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }

  public calculateIntermediateResult(
    numbers: number[],
    operators: (Operator | null)[]
  ): number {
    let result = numbers[0];
    for (let i = 0; i < operators.length; i++) {
      if (operators[i] === null) break;
      const nextNumber = numbers[i + 1];
      switch (operators[i]) {
        case "+":
          result += nextNumber;
          break;
        case "-":
          result -= nextNumber;
          break;
        case "*":
          result *= nextNumber;
          break;
        case "/":
          result /= nextNumber;
          break;
      }
    }
    return result;
  }

  public resetOperators(): void {
    if (
      this.gameState.difficultyStates[this.gameState.difficulty].isCompleted ||
      this.gameState.difficultyStates[this.gameState.difficulty].lives <= 0
    ) {
      return;
    }

    const currentDifficultyState =
      this.gameState.difficultyStates[this.gameState.difficulty];
    const now = Date.now();
    const timeSinceLastUpdate = now - currentDifficultyState.lastUpdate;
    const additionalScore = Math.floor(timeSinceLastUpdate / 1000);
    const currentScore = currentDifficultyState.score + additionalScore;
    const newScore = currentScore + 20; // Add 20 points for resetting

    const updatedDifficultyStates = {
      ...this.gameState.difficultyStates,
      [this.gameState.difficulty]: {
        ...currentDifficultyState,
        score: newScore,
        lastUpdate: now,
      },
    };

    this.gameState = {
      ...this.gameState,
      operators: [null, null, null, null],
      result: null,
      isCorrect: false,
      difficultyStates: updatedDifficultyStates,
    };
    this.saveState();
  }
}
