import { Operator, Difficulty } from '../types/math';

export interface MathTask {
  numbers: number[];
  operators: Operator[];
  result: number;
  difficulty: Difficulty;
}

export interface TaskValidationResult {
  isValid: boolean;
  error?: string;
  solutions?: Array<{
    operators: Operator[];
    result: number;
  }>;
}

const OPERATORS: Operator[] = ['+', '-', '*', '/'];

interface DifficultyRule {
  description: string;
  generateNumber: () => number;
  validateResult: (result: number) => boolean;
}

const DIFFICULTY_RULES: Record<Difficulty, DifficultyRule> = {
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

export function calculateResult(numbers: number[], operators: Operator[]): { result: number; isInteger: boolean } {
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
}

export function findAllSolutions(numbers: number[]): Array<{ operators: Operator[]; result: number }> {
  const operatorCombinations: Operator[][] = [];
  const solutions: Array<{ operators: Operator[]; result: number }> = [];
  
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
    if (isInteger) {
      solutions.push({ operators, result });
    }
  }

  return solutions.sort((a, b) => a.result - b.result);
}

export function validateTask(task: MathTask): TaskValidationResult {
  const solutions = findAllSolutions(task.numbers);
  
  // Wenn keine Lösungen oder mehr als eine Lösung, dann ungültig
  if (solutions.length !== 1) {
    return { 
      isValid: false, 
      error: "Es wurden mehr als eine Lösung gefunden",
      solutions 
    };
  }
  
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
    const { result, isInteger } = calculateResult(task.numbers, operators);
    if (isInteger && DIFFICULTY_RULES[task.difficulty].validateResult(result)) {
      allPossibleResults.add(result);
    }
  }

  // Konvertiere zu Array und sortiere
  const sortedResults = Array.from(allPossibleResults).sort((a, b) => a - b);
  
  // Die Lösung ist nur gültig, wenn sie die kleinste Zahl ist
  // Bei Level 4 müssen wir auch prüfen, ob es keine andere Kombination gibt, die das gleiche Ergebnis liefert
  if (task.difficulty === 4) {
    const sameResultCount = Array.from(allPossibleResults).filter(r => r === bestSolution.result).length;
    if (sameResultCount > 1) {
      return { 
        isValid: false, 
        error: "Es gibt mehrere Lösungen mit dem gleichen Ergebnis",
        solutions 
      };
    }
  }
  
  return {
    isValid: sortedResults[0] === bestSolution.result,
    error: sortedResults[0] === bestSolution.result ? undefined : "Die gefundene Lösung ist nicht korrekt",
    solutions
  };
}

export function generateTask(difficulty: Difficulty): MathTask {
  const generateRandomNumbers = (): number[] => {
    const numbers = Array.from({ length: 5 }, () => DIFFICULTY_RULES[difficulty].generateNumber());
    
    // Für Level 3 und 4: Stelle sicher, dass mindestens eine negative Zahl dabei ist
    if (difficulty >= 3 && !numbers.some(n => n < 0)) {
      // Wähle eine zufällige Position und ersetze die Zahl durch eine negative
      const position = Math.floor(Math.random() * 5);
      const rand = Math.random();
      if (rand < 0.4) {
        numbers[position] = -(Math.floor(Math.random() * 3) + 1); // -1 bis -3
      } else if (rand < 0.8) {
        numbers[position] = -(Math.floor(Math.random() * 6) + 4); // -4 bis -9
      } else if (rand < 0.95) {
        numbers[position] = -(Math.floor(Math.random() * 50) + 10); // -10 bis -59
      } else {
        numbers[position] = -(Math.floor(Math.random() * 40) + 60); // -60 bis -99
      }
    }
    
    return numbers;
  };

  let numbers = generateRandomNumbers();
  let attempts = 0;
  const maxAttempts = 1000; // Verhindert Endlosschleifen

  while (attempts < maxAttempts) {
    const validation = validateTask({ numbers, operators: [], result: 0, difficulty });
    if (validation.isValid) {
      return {
        numbers,
        operators: validation.solutions![0].operators,
        result: validation.solutions![0].result,
        difficulty
      };
    }
    numbers = generateRandomNumbers();
    attempts++;
  }

  // Fallback auf sichere Zahlen
  return {
    numbers: [1, 2, 3, 4, 5],
    operators: ['+', '-', '*', '/'],
    result: 1,
    difficulty
  };
}

export function getDifficultyDescription(difficulty: Difficulty): string {
  switch (difficulty) {
    case 1:
      return "Level 1: Nur positive einstellige Zahlen (1-9)";
    case 2:
      return "Level 2: Positive ein- und zweistellige Zahlen (1-99)";
    case 3:
      return "Level 3: Positive und negative ein- und zweistellige Zahlen (-99 bis 99)";
    case 4:
      return "Level 4: Positive und negative ein- und zweistellige Zahlen (-99 bis 99)";
    default:
      return "Unbekannter Schwierigkeitsgrad";
  }
} 