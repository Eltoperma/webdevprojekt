'use client';

import { useState, useEffect } from 'react';

type Operator = '+' | '-' | '*' | '/';
type Difficulty = 1 | 2 | 3 | 4;

interface GameState {
  numbers: number[];
  operators: (Operator | null)[];
  result: number | null;
  attempts: number;
  previousAttempts: Array<{
    numbers: number[];
    operators: (Operator | null)[];
    result: number;
  }>;
  isIntegerResult: boolean;
  difficulty: Difficulty;
}

interface Solution {
  operators: Operator[];
  result: number;
}

const OPERATORS: Operator[] = ['+', '-', '*', '/'];

const DIFFICULTY_RULES = {
  1: {
    description: "Level 1: Nur positive einstellige Zahlen (1-9)",
    generateNumber: () => {
      // 70% Chance für 1-3, 30% Chance für 4-9
      return Math.random() < 0.7 
        ? Math.floor(Math.random() * 3) + 1  // 1-3
        : Math.floor(Math.random() * 6) + 4; // 4-9
    },
    validateResult: (result: number) => result > 0,
  },
  2: {
    description: "Level 2: Positive ein- und zweistellige Zahlen (1-99)",
    generateNumber: () => {
      const rand = Math.random();
      if (rand < 0.4) {
        // 40% Chance für 1-3
        return Math.floor(Math.random() * 3) + 1;
      } else if (rand < 0.8) {
        // 40% Chance für 4-9
        return Math.floor(Math.random() * 6) + 4;
      } else if (rand < 0.95) {
        // 15% Chance für 10-59
        return Math.floor(Math.random() * 50) + 10;
      } else {
        // 5% Chance für 60-99
        return Math.floor(Math.random() * 40) + 60;
      }
    },
    validateResult: (result: number) => result > 0,
  },
  3: {
    description: "Level 3: Positive und negative ein- und zweistellige Zahlen (-99 bis 99)",
    generateNumber: () => {
      const rand = Math.random();
      if (rand < 0.4) {
        // 40% Chance für -3 bis 3
        return Math.floor(Math.random() * 7) - 3;
      } else if (rand < 0.8) {
        // 40% Chance für -9 bis -4 oder 4 bis 9
        return Math.random() < 0.5
          ? Math.floor(Math.random() * 6) + 4
          : -(Math.floor(Math.random() * 6) + 4);
      } else if (rand < 0.95) {
        // 15% Chance für -59 bis -10 oder 10 bis 59
        return Math.random() < 0.5
          ? Math.floor(Math.random() * 50) + 10
          : -(Math.floor(Math.random() * 50) + 10);
      } else {
        // 5% Chance für -99 bis -60 oder 60 bis 99
        return Math.random() < 0.5
          ? Math.floor(Math.random() * 40) + 60
          : -(Math.floor(Math.random() * 40) + 60);
      }
    },
    validateResult: (result: number) => result > 0,
  },
  4: {
    description: "Level 4: Positive und negative ein- und zweistellige Zahlen (-99 bis 99)",
    generateNumber: () => {
      const rand = Math.random();
      if (rand < 0.4) {
        // 40% Chance für -3 bis 3
        return Math.floor(Math.random() * 7) - 3;
      } else if (rand < 0.8) {
        // 40% Chance für -9 bis -4 oder 4 bis 9
        return Math.random() < 0.5
          ? Math.floor(Math.random() * 6) + 4
          : -(Math.floor(Math.random() * 6) + 4);
      } else if (rand < 0.95) {
        // 15% Chance für -59 bis -10 oder 10 bis 59
        return Math.random() < 0.5
          ? Math.floor(Math.random() * 50) + 10
          : -(Math.floor(Math.random() * 50) + 10);
      } else {
        // 5% Chance für -99 bis -60 oder 60 bis 99
        return Math.random() < 0.5
          ? Math.floor(Math.random() * 40) + 60
          : -(Math.floor(Math.random() * 40) + 60);
      }
    },
    validateResult: (result: number) => true, // Alle Ergebnisse erlaubt, aber Validierung erfolgt in hasValidCombination
  },
};

export default function MathGame() {
  const [gameState, setGameState] = useState<GameState>({
    numbers: [4, 5, 6, 7, 8],
    operators: [null, null, null, null],
    result: null,
    attempts: 0,
    previousAttempts: [],
    isIntegerResult: true,
    difficulty: 1,
  });

  const [solutions, setSolutions] = useState<Solution[]>([]);

  const calculateResult = (numbers: number[], operators: (Operator | null)[]): { result: number; isInteger: boolean } => {
    if (operators.some(op => op === null)) return { result: 0, isInteger: true };
    
    let result = numbers[0];
    for (let i = 0; i < operators.length; i++) {
      const operator = operators[i];
      const nextNumber = numbers[i + 1];
      
      switch (operator) {
        case '+':
          result += nextNumber;
          break;
        case '-':
          result -= nextNumber;
          break;
        case '*':
          result *= nextNumber;
          break;
        case '/':
          result = result / nextNumber;
          break;
      }
    }
    return { result, isInteger: Number.isInteger(result) };
  };

  const findAllSolutions = (numbers: number[]): Solution[] => {
    const operatorCombinations: Operator[][] = [];
    const solutions: Solution[] = [];
    
    const generateCombinations = (current: Operator[], used: Set<Operator>) => {
      if (current.length === 4) {
        operatorCombinations.push([...current]);
        return;
      }
      
      for (const op of OPERATORS) {
        if (!used.has(op)) {
          current.push(op);
          used.add(op);
          generateCombinations(current, used);
          current.pop();
          used.delete(op);
        }
      }
    };
    
    generateCombinations([], new Set());

    for (const operators of operatorCombinations) {
      const { result, isInteger } = calculateResult(numbers, operators);
      if (isInteger && DIFFICULTY_RULES[gameState.difficulty].validateResult(result)) {
        solutions.push({ operators, result });
      }
    }

    return solutions.sort((a, b) => a.result - b.result);
  };

  const isOperatorUsed = (operator: Operator): boolean => {
    return gameState.operators.includes(operator);
  };

  const generateValidNumbers = (): number[] => {
    const generateRandomNumbers = (): number[] => {
      return Array.from({ length: 5 }, () => DIFFICULTY_RULES[gameState.difficulty].generateNumber());
    };

    const hasValidCombination = (numbers: number[]): boolean => {
      const solutions = findAllSolutions(numbers);
      
      // Wenn keine Lösungen oder mehr als eine Lösung, dann ungültig
      if (solutions.length !== 1) return false;
      
      // Prüfe, ob die gefundene Lösung wirklich die kleinste mögliche Zahl ist
      const bestSolution = solutions[0];
      const allPossibleResults = new Set<number>();
      
      // Generiere alle möglichen Operator-Kombinationen
      const operatorCombinations: Operator[][] = [];
      const generateCombinations = (current: Operator[], used: Set<Operator>) => {
        if (current.length === 4) {
          operatorCombinations.push([...current]);
          return;
        }
        
        for (const op of OPERATORS) {
          if (!used.has(op)) {
            current.push(op);
            used.add(op);
            generateCombinations(current, used);
            current.pop();
            used.delete(op);
          }
        }
      };
      
      generateCombinations([], new Set());

      // Berechne alle möglichen Ergebnisse
      for (const operators of operatorCombinations) {
        const { result, isInteger } = calculateResult(numbers, operators);
        if (isInteger && DIFFICULTY_RULES[gameState.difficulty].validateResult(result)) {
          allPossibleResults.add(result);
        }
      }

      // Konvertiere zu Array und sortiere
      const sortedResults = Array.from(allPossibleResults).sort((a, b) => a - b);
      
      // Die Lösung ist nur gültig, wenn sie die kleinste Zahl ist
      // Bei Level 4 müssen wir auch prüfen, ob es keine andere Kombination gibt, die das gleiche Ergebnis liefert
      if (gameState.difficulty === 4) {
        const sameResultCount = Array.from(allPossibleResults).filter(r => r === bestSolution.result).length;
        if (sameResultCount > 1) return false;
      }
      
      return sortedResults[0] === bestSolution.result;
    };

    let numbers = generateRandomNumbers();
    let attempts = 0;
    const maxAttempts = 1000; // Verhindert Endlosschleifen

    while (!hasValidCombination(numbers) && attempts < maxAttempts) {
      numbers = generateRandomNumbers();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      // Fallback auf sichere Zahlen
      return [1, 2, 3, 4, 5];
    }
    
    return numbers;
  };

  const handleOperatorClick = (index: number, operator: Operator) => {
    if (isOperatorUsed(operator)) return;

    const newOperators = [...gameState.operators];
    newOperators[index] = operator;
    
    setGameState(prev => ({
      ...prev,
      operators: newOperators,
    }));
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setGameState(prev => ({
      ...prev,
      difficulty: newDifficulty,
      numbers: generateValidNumbers(),
      operators: [null, null, null, null],
      result: null,
    }));
  };

  const checkResult = () => {
    if (gameState.operators.some(op => op === null)) return;
    
    const { result, isInteger } = calculateResult(gameState.numbers, gameState.operators);
    
    setGameState(prev => ({
      ...prev,
      result,
      isIntegerResult: isInteger,
      attempts: prev.attempts + 1,
      previousAttempts: [...prev.previousAttempts, {
        numbers: prev.numbers,
        operators: prev.operators,
        result,
      }],
      numbers: generateValidNumbers(),
      operators: [null, null, null, null],
    }));
  };

  useEffect(() => {
    if (gameState.operators.every(op => op !== null)) {
      checkResult();
    }
  }, [gameState.operators]);

  useEffect(() => {
    setSolutions(findAllSolutions(gameState.numbers));
  }, [gameState.numbers]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mathe Spiel</h1>
      
      {/* Difficulty Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Schwierigkeitsgrad</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((level) => (
            <button
              key={level}
              onClick={() => handleDifficultyChange(level as Difficulty)}
              className={`px-4 py-2 rounded ${
                gameState.difficulty === level
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Level {level}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {DIFFICULTY_RULES[gameState.difficulty].description}
        </p>
      </div>
      
      {/* Debug Solutions */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug: Mögliche Lösungen</h2>
        <div className="space-y-2">
          {solutions.map((solution, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">#{index + 1}:</span>
              <div className="flex items-center">
                {gameState.numbers.map((num, i) => (
                  <div key={i} className="flex items-center">
                    <span className="text-sm font-mono">{num}</span>
                    {i < solution.operators.length && (
                      <span className="mx-1 text-sm">{solution.operators[i]}</span>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-sm font-bold">= {solution.result}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Previous attempts */}
      {gameState.previousAttempts.map((attempt, index) => (
        <div key={index} className="mb-4 p-4 bg-gray-100 rounded-lg opacity-50">
          <div className="flex items-center justify-center space-x-2">
            {attempt.numbers.map((num, i) => (
              <div key={i} className="flex items-center">
                <span className="text-xl font-mono">{num}</span>
                {i < attempt.operators.length && (
                  <span className="mx-2 text-xl">{attempt.operators[i]}</span>
                )}
              </div>
            ))}
            <span className="ml-4">= {attempt.result}</span>
          </div>
        </div>
      ))}

      {/* Current game state */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          {gameState.numbers.map((num, i) => (
            <div key={i} className="flex items-center">
              <span className="text-2xl font-mono">{num}</span>
              {i < gameState.operators.length && (
                <div className="mx-2">
                  <button
                    onClick={() => handleOperatorClick(i, '+')}
                    disabled={isOperatorUsed('+')}
                    className={`w-8 h-8 rounded ${
                      gameState.operators[i] === '+' 
                        ? 'bg-blue-500 text-white' 
                        : isOperatorUsed('+')
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleOperatorClick(i, '-')}
                    disabled={isOperatorUsed('-')}
                    className={`w-8 h-8 rounded ${
                      gameState.operators[i] === '-' 
                        ? 'bg-blue-500 text-white' 
                        : isOperatorUsed('-')
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleOperatorClick(i, '*')}
                    disabled={isOperatorUsed('*')}
                    className={`w-8 h-8 rounded ${
                      gameState.operators[i] === '*' 
                        ? 'bg-blue-500 text-white' 
                        : isOperatorUsed('*')
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    ×
                  </button>
                  <button
                    onClick={() => handleOperatorClick(i, '/')}
                    disabled={isOperatorUsed('/')}
                    className={`w-8 h-8 rounded ${
                      gameState.operators[i] === '/' 
                        ? 'bg-blue-500 text-white' 
                        : isOperatorUsed('/')
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    ÷
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {gameState.result !== null && (
        <div className="text-center">
          <div className={`text-xl font-bold ${!gameState.isIntegerResult ? 'text-red-500' : ''}`}>
            Ergebnis: {gameState.result}
            {!gameState.isIntegerResult && (
              <span className="ml-2 inline-flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span className="ml-1 text-sm">Das Ergebnis muss eine ganze Zahl sein!</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 