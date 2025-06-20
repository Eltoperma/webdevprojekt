import { Operator, Difficulty } from "../types/math";
import {
  getDailyGames,
  DailyGames,
  saveHighscore,
} from "../../../server/services/mathGameService";
import { DifficultyState, GameState, SavedGameState } from "./types/interfaces";
import { encryptData, decryptData } from "./utils/crypto";

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

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  private updateScoreForTimePassed(
    difficultyStates: Record<Difficulty, DifficultyState>
  ): void {
    const now = Date.now();
    Object.keys(difficultyStates).forEach((difficulty) => {
      const state = difficultyStates[difficulty as unknown as Difficulty];
      if (!state.isCompleted && state.lives > 0) {
        const timeSinceLastUpdate = now - state.lastUpdate;
        const additionalScore = Math.floor(timeSinceLastUpdate / 1000);
        state.score = state.score + additionalScore;
        state.lastUpdate = now;
      }
    });
  }

  private createGameStateFromSavedState(
    parsedState: SavedGameState,
    updatedDifficultyStates: Record<Difficulty, DifficultyState>
  ): GameState {
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

  public async loadSavedStateFromClient(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    const savedState = localStorage.getItem(this.STORAGE_KEY);
    if (!savedState) {
      this.gameState = this.getDefaultState();
      return;
    }

    try {
      // Try to parse as encrypted data first
      const encryptedData = JSON.parse(savedState);

      // Check if it's the new encrypted format (has data and hash properties)
      if (encryptedData.data && encryptedData.hash) {
        const parsedState = (await decryptData(
          encryptedData
        )) as SavedGameState;

        if (!parsedState) {
          console.warn("Failed to decrypt saved state - using default state");
          this.gameState = this.getDefaultState();
          return;
        }

        const savedDate = new Date(parsedState.savedDate);
        const currentDate = new Date();

        if (!this.isSameDay(savedDate, currentDate)) {
          this.gameState = this.getDefaultState();
          return;
        }

        const updatedDifficultyStates = { ...parsedState.difficultyStates };
        this.updateScoreForTimePassed(updatedDifficultyStates);

        this.gameState = this.createGameStateFromSavedState(
          parsedState,
          updatedDifficultyStates
        );
      } else {
        // Handle old plain JSON format
        console.log("Migrating from old plain JSON format to encrypted format");
        const parsedState = encryptedData as SavedGameState;

        const savedDate = new Date(parsedState.savedDate);
        const currentDate = new Date();

        if (!this.isSameDay(savedDate, currentDate)) {
          this.gameState = this.getDefaultState();
          return;
        }

        const updatedDifficultyStates = { ...parsedState.difficultyStates };
        this.updateScoreForTimePassed(updatedDifficultyStates);

        this.gameState = this.createGameStateFromSavedState(
          parsedState,
          updatedDifficultyStates
        );

        // Save in new encrypted format
        await this.saveState();
      }
    } catch (error) {
      console.error("Failed to parse saved game state:", error);
      this.gameState = this.getDefaultState();
    }
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

  public async handleOperatorClick(
    index: number,
    operator: Operator
  ): Promise<void> {
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
    await this.saveState();
  }

  private updateCurrentDifficultyScore(
    updatedDifficultyStates: Record<Difficulty, DifficultyState>
  ): void {
    const now = Date.now();
    const currentState = updatedDifficultyStates[this.gameState.difficulty];
    if (!currentState.isCompleted && currentState.lives > 0) {
      const timeSinceLastUpdate = now - currentState.lastUpdate;
      const additionalScore = Math.floor(timeSinceLastUpdate / 1000);
      currentState.score = currentState.score + additionalScore;
      currentState.lastUpdate = now;
    }
  }

  private updateNewDifficultyState(
    updatedDifficultyStates: Record<Difficulty, DifficultyState>,
    newDifficulty: Difficulty
  ): void {
    const now = Date.now();
    const currentDifficultyState =
      this.gameState.difficultyStates[newDifficulty];

    updatedDifficultyStates[newDifficulty] = {
      ...currentDifficultyState,
      lastUpdate: now,
      score: currentDifficultyState.score,
      lives: currentDifficultyState.lives,
      previousAttempts: currentDifficultyState.previousAttempts,
      isCompleted: currentDifficultyState.isCompleted,
      finalResult: currentDifficultyState.finalResult,
    };
  }

  private createOperatorsForDifficulty(
    currentDifficultyState: DifficultyState
  ): (Operator | null)[] {
    if (currentDifficultyState.isCompleted) {
      return (
        currentDifficultyState.finalResult?.operators || [
          null,
          null,
          null,
          null,
        ]
      );
    }
    return [null, null, null, null];
  }

  public async handleDifficultyChange(
    newDifficulty: Difficulty
  ): Promise<void> {
    if (!this.dailyGames) {
      return;
    }

    const currentGame = this.dailyGames[this.getDifficultyKey(newDifficulty)];
    const currentDifficultyState =
      this.gameState.difficultyStates[newDifficulty];
    const updatedDifficultyStates = { ...this.gameState.difficultyStates };

    this.updateCurrentDifficultyScore(updatedDifficultyStates);
    this.updateNewDifficultyState(updatedDifficultyStates, newDifficulty);

    this.gameState = {
      ...this.gameState,
      difficulty: newDifficulty,
      numbers: currentGame.numbers,
      operators: this.createOperatorsForDifficulty(currentDifficultyState),
      result: currentDifficultyState.isCompleted
        ? currentDifficultyState.finalResult?.result || null
        : null,
      currentGameId: currentGame.math_game_id,
      isCorrect: currentDifficultyState.isCompleted,
      difficultyStates: updatedDifficultyStates,
    };

    await this.saveState();
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

  private async handleCorrectAnswer(result: number): Promise<void> {
    const now = Date.now();
    const currentState =
      this.gameState.difficultyStates[this.gameState.difficulty];
    const timeSinceLastUpdate = now - currentState.lastUpdate;
    const additionalScore = Math.floor(timeSinceLastUpdate / 1000);
    const finalScore = currentState.score + additionalScore;

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
          result: result,
        },
      },
    };

    this.gameState = {
      ...this.gameState,
      result: result,
      isCorrect: true,
      isIntegerResult: Number.isInteger(result),
      difficultyStates: updatedDifficultyStates,
    };
  }

  private handleIncorrectAnswer(result: number): void {
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
            result: result,
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
      result: result,
      isIntegerResult: Number.isInteger(result),
      isCorrect: false,
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

  public async confirmResult(): Promise<void> {
    if (this.gameState.operators.some((op) => op === null)) {
      return;
    }

    const { result } = this.calculateResult(
      this.gameState.numbers,
      this.gameState.operators as Operator[]
    );

    const isCorrect = this.dailyGames
      ? result ===
        this.dailyGames[this.getDifficultyKey(this.gameState.difficulty)].result
      : false;

    if (isCorrect) {
      await this.handleCorrectAnswer(result);
    } else {
      this.handleIncorrectAnswer(result);
    }

    this.saveState();
  }

  private isOperatorUsed(operator: Operator): boolean {
    return this.gameState.operators.includes(operator);
  }

  private async saveState(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stateToSave: SavedGameState = {
        difficultyStates: this.gameState.difficultyStates,
        difficulty: this.gameState.difficulty,
        savedDate: new Date().toISOString(),
      };

      const encryptedData = await encryptData(stateToSave);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(encryptedData));
    } catch (error) {
      console.error("Failed to save encrypted state:", error);
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

  private calculateResetScore(currentDifficultyState: DifficultyState): number {
    const now = Date.now();
    const timeSinceLastUpdate = now - currentDifficultyState.lastUpdate;
    const additionalScore = Math.floor(timeSinceLastUpdate / 1000);
    const currentScore = currentDifficultyState.score + additionalScore;
    return currentScore + 20; // Add 20 points for resetting
  }

  public async resetOperators(): Promise<void> {
    const currentDifficultyState =
      this.gameState.difficultyStates[this.gameState.difficulty];

    if (
      currentDifficultyState.isCompleted ||
      currentDifficultyState.lives <= 0
    ) {
      return;
    }

    const newScore = this.calculateResetScore(currentDifficultyState);
    const now = Date.now();

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

    await this.saveState();
  }
}
