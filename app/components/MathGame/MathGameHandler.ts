import { Operator, Difficulty } from "../types/math";
import {
  getDailyGames,
  DailyGames,
  saveGameAttempt,
} from "../../../server/services/mathGameService";

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
  private selectedOperatorIndex: number = 0;
  private isKeyboardMode: boolean = false;
  private readonly STORAGE_KEY = "mathGameState";

  constructor() {
    this.gameState = this.loadSavedState();
  }

  private loadSavedState(): GameState {
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

            const stateToSave: SavedGameState = {
              difficultyStates: updatedDifficultyStates,
              difficulty: parsedState.difficulty,
              savedDate: new Date().toISOString(),
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));

            const currentDifficultyState =
              updatedDifficultyStates[parsedState.difficulty];
            return {
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
          }
        } catch (e) {
          console.error("Failed to parse saved game state:", e);
        }
      }
    }

    const now = Date.now();
    const defaultState: GameState = {
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

    const stateToSave: SavedGameState = {
      difficultyStates: defaultState.difficultyStates,
      difficulty: defaultState.difficulty,
      savedDate: new Date().toISOString(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));

    return defaultState;
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
      selectedOperatorIndex: this.selectedOperatorIndex,
      isKeyboardMode: this.isKeyboardMode,
      dailyGames: this.dailyGames,
    };
  }

  public handleOperatorClick(index: number, operator: Operator): void {
    if (index === -1) {
      this.isKeyboardMode = false;
      this.selectedOperatorIndex = -1;
      this.saveState();
      return;
    }

    if (this.isOperatorUsed(operator)) return;
    this.isKeyboardMode = false;
    this.selectedOperatorIndex = -1;

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
    if (this.selectedOperatorIndex < this.gameState.operators.length) {
      this.isKeyboardMode = true;
      this.handleOperatorClick(this.selectedOperatorIndex, operator);
    }
  }

  public handleKeyPress(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === "a") {
      this.isKeyboardMode = true;
      const prevDifficulty = (((this.gameState.difficulty + 2) % 4) +
        1) as Difficulty;
      this.handleDifficultyChange(prevDifficulty);
      return;
    }
    if (event.key.toLowerCase() === "d") {
      this.isKeyboardMode = true;
      const nextDifficulty = ((this.gameState.difficulty % 4) +
        1) as Difficulty;
      this.handleDifficultyChange(nextDifficulty);
      return;
    }

    if (
      this.gameState.difficultyStates[this.gameState.difficulty].isCompleted ||
      this.gameState.difficultyStates[this.gameState.difficulty].lives <= 0
    ) {
      return;
    }

    if (event.key >= "1" && event.key <= "4") {
      const operators: Operator[] = ["+", "-", "*", "/"];
      const operatorIndex = parseInt(event.key) - 1;
      this.handleOperatorSelect(operators[operatorIndex]);
    } else if (event.key === " ") {
      this.isKeyboardMode = true;
      if (this.selectedOperatorIndex < this.gameState.operators.length - 1) {
        this.selectedOperatorIndex++;
      } else if (this.gameState.operators.every((op) => op !== null)) {
        this.confirmResult();
      }
    }
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

    this.selectedOperatorIndex = 0;
    this.saveState();
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

    if (this.gameState.currentGameId) {
      await saveGameAttempt(
        this.gameState.currentGameId,
        this.gameState.numbers,
        this.gameState.operators as string[],
        result
      );
    }

    if (isCorrect) {
      const now = Date.now();
      const currentState =
        this.gameState.difficultyStates[this.gameState.difficulty];
      const timeSinceLastUpdate = now - currentState.lastUpdate;
      const additionalScore = Math.floor(timeSinceLastUpdate / 1000);
      const finalScore = currentState.score + additionalScore;

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
    this.selectedOperatorIndex = 0;
    this.saveState();
  }

  private isOperatorUsed(operator: Operator): boolean {
    return this.gameState.operators.includes(operator);
  }

  private saveState(): void {
    const stateToSave: SavedGameState = {
      difficultyStates: this.gameState.difficultyStates,
      difficulty: this.gameState.difficulty,
      savedDate: new Date().toISOString(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
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
    this.selectedOperatorIndex = 0;

    // Save the updated state to localStorage
    const stateToSave: SavedGameState = {
      difficultyStates: updatedDifficultyStates,
      difficulty: this.gameState.difficulty,
      savedDate: new Date().toISOString(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
  }
}
