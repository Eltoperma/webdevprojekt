'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Operator, Difficulty } from '../types/math';
import { generateTask, calculateResult, findAllSolutions, getDifficultyDescription } from '../lib/mathTasks';

const ReactConfetti = dynamic(() => import('react-confetti'), {
  ssr: false
});

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
  isCorrect: boolean;
  lives: number;
}

export default function MathGame() {
  const [gameState, setGameState] = useState<GameState>({
    numbers: [4, 5, 6, 7, 8],
    operators: [null, null, null, null],
    result: null,
    attempts: 0,
    previousAttempts: [],
    isIntegerResult: true,
    difficulty: 1,
    isCorrect: false,
    lives: 3,
  });

  const [solutions, setSolutions] = useState<Array<{ operators: Operator[]; result: number }>>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isOperatorUsed = (operator: Operator): boolean => {
    return gameState.operators.includes(operator);
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
    const task = generateTask(newDifficulty);
    setGameState(prev => ({
      ...prev,
      difficulty: newDifficulty,
      numbers: task.numbers,
      operators: [null, null, null, null],
      result: null,
    }));
  };

  const confirmResult = () => {
    if (gameState.operators.some(op => op === null)) return;
    
    const { result, isInteger } = calculateResult(gameState.numbers, gameState.operators as Operator[]);
    const solutions = findAllSolutions(gameState.numbers);
    const isCorrect = solutions.length === 1 && solutions[0].result === result;
    
    if (isCorrect) {
      // Wenn die Antwort korrekt ist, neue Aufgabe generieren
      const task = generateTask(gameState.difficulty);
      setGameState(prev => ({
        ...prev,
        numbers: task.numbers,
        operators: [null, null, null, null],
        result: null,
        previousAttempts: [],
        lives: 3,
        isCorrect: false,
      }));
    } else {
      // Wenn die Antwort falsch ist
      const newLives = gameState.lives - 1;
      
      // Setze das Ergebnis und den Status
      setGameState(prev => ({
        ...prev,
        result,
        isIntegerResult: isInteger,
        isCorrect,
        previousAttempts: [...prev.previousAttempts, {
          numbers: prev.numbers,
          operators: prev.operators,
          result,
        }],
        lives: newLives,
        // Wenn keine Leben mehr übrig sind, zeige die Lösung
        ...(newLives <= 0 && {
          operators: solutions[0].operators,
          result: solutions[0].result,
          isCorrect: true
        })
      }));
    }
  };

  useEffect(() => {
    setSolutions(findAllSolutions(gameState.numbers));
  }, [gameState.numbers]);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Mathe Spiel</h1>
      </div>
      
      {/* Difficulty Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 dark:text-white">Schwierigkeitsgrad</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((level) => (
            <button
              key={level}
              onClick={() => handleDifficultyChange(level as Difficulty)}
              className={`px-4 py-2 rounded ${
                gameState.difficulty === level
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
              }`}
            >
              Level {level}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {getDifficultyDescription(gameState.difficulty)}
        </p>
      </div>

      {/* Current game state */}
      <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          {gameState.numbers.map((num, i) => (
            <div key={i} className="flex items-center">
              <span className="text-2xl font-mono dark:text-white">{num}</span>
              {i < gameState.operators.length && (
                <div className="mx-2">
                  <button
                    onClick={() => handleOperatorClick(i, '+')}
                    disabled={isOperatorUsed('+') || gameState.lives <= 0}
                    className={`w-8 h-8 rounded ${
                      gameState.operators[i] === '+' 
                        ? 'bg-blue-500 text-white' 
                        : isOperatorUsed('+') || gameState.lives <= 0
                          ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                    }`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleOperatorClick(i, '-')}
                    disabled={isOperatorUsed('-') || gameState.lives <= 0}
                    className={`w-8 h-8 rounded ${
                      gameState.operators[i] === '-' 
                        ? 'bg-blue-500 text-white' 
                        : isOperatorUsed('-') || gameState.lives <= 0
                          ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                    }`}
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleOperatorClick(i, '*')}
                    disabled={isOperatorUsed('*') || gameState.lives <= 0}
                    className={`w-8 h-8 rounded ${
                      gameState.operators[i] === '*' 
                        ? 'bg-blue-500 text-white' 
                        : isOperatorUsed('*') || gameState.lives <= 0
                          ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                    }`}
                  >
                    ×
                  </button>
                  <button
                    onClick={() => handleOperatorClick(i, '/')}
                    disabled={isOperatorUsed('/') || gameState.lives <= 0}
                    className={`w-8 h-8 rounded ${
                      gameState.operators[i] === '/' 
                        ? 'bg-blue-500 text-white' 
                        : isOperatorUsed('/') || gameState.lives <= 0
                          ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                    }`}
                  >
                    ÷
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={confirmResult}
            disabled={gameState.operators.some(op => op === null) || gameState.lives <= 0}
            className={`ml-4 w-12 h-12 rounded-lg text-2xl font-bold ${
              gameState.operators.some(op => op === null) || gameState.lives <= 0
                ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            =
          </button>
        </div>

        {/* Lives display */}
        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="text-sm font-semibold dark:text-white">Leben:</span>
          {[...Array(3)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 ${i < gameState.lives ? 'text-red-500' : 'text-gray-300 dark:text-gray-600'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>

        {gameState.result !== null && (
          <div className="mt-4 text-center">
            {gameState.lives <= 0 ? (
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 dark:text-white">Lösung:</h2>
                <div className="flex items-center justify-center space-x-2">
                  {gameState.numbers.map((num, i) => (
                    <div key={i} className="flex items-center">
                      <span className="text-xl font-mono dark:text-white">{num}</span>
                      {i < solutions[0].operators.length && (
                        <span className="mx-2 text-xl dark:text-white">{solutions[0].operators[i]}</span>
                      )}
                    </div>
                  ))}
                  <span className="ml-4 text-xl font-bold dark:text-white">= {solutions[0].result}</span>
                </div>
              </div>
            ) : (
              <div className={`text-xl font-bold p-4 rounded-lg transition-colors duration-300 ${
                gameState.isCorrect 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : !gameState.isIntegerResult 
                    ? 'text-red-500 dark:text-red-400' 
                    : ''
              }`}>
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
                    <span className="ml-1 text-sm dark:text-white">Das Ergebnis muss eine ganze Zahl sein!</span>
                  </span>
                )}
                {gameState.isCorrect && (
                  <span className="ml-2 inline-flex items-center text-green-700 dark:text-green-300">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <span className="ml-1 text-sm">Richtig!</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Previous attempts */}
      {[...gameState.previousAttempts].reverse().map((attempt, index) => (
        <div key={index} className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg opacity-50">
          <div className="flex items-center justify-center space-x-2">
            {attempt.numbers.map((num, i) => (
              <div key={i} className="flex items-center">
                <span className="text-xl font-mono dark:text-white">{num}</span>
                {i < attempt.operators.length && (
                  <span className="mx-2 text-xl dark:text-white">{attempt.operators[i]}</span>
                )}
              </div>
            ))}
            <span className="ml-4 dark:text-white">= {attempt.result}</span>
          </div>
        </div>
      ))}
    </div>
  );
} 