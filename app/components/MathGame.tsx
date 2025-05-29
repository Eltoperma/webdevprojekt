'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Operator, Difficulty } from '../types/math';
import { calculateResult, getDifficultyDescription } from '../lib/mathTasks';
import { getDailyGames, DailyGames, saveGameAttempt } from '../services/mathGameService';

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
  currentGameId: number | null;
}

export default function MathGame() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    numbers: [],
    operators: [null, null, null, null],
    result: null,
    attempts: 0,
    previousAttempts: [],
    isIntegerResult: true,
    difficulty: 1,
    isCorrect: false,
    lives: 3,
    currentGameId: null,
  });

  const [dailyGames, setDailyGames] = useState<DailyGames | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const loadGames = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const games = await getDailyGames();
        
        if (!games) {
          setError('No games available for today');
          return;
        }

        setDailyGames(games);
        const currentGame = games[getDifficultyKey(gameState.difficulty)];
        setGameState(prev => ({
          ...prev,
          numbers: currentGame.numbers,
          currentGameId: currentGame.math_game_id,
        }));
      } catch (err) {
        setError('Failed to load games. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();
  }, []);

  const getDifficultyKey = (difficulty: number): keyof DailyGames => {
    switch (difficulty) {
      case 1: return 'easy';
      case 2: return 'medium';
      case 3: return 'hard';
      case 4: return 'expert';
      default: return 'easy';
    }
  };

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
    if (isOperatorUsed(operator) || isLoading) return;

    const newOperators = [...gameState.operators];
    newOperators[index] = operator;
    
    setGameState(prev => ({
      ...prev,
      operators: newOperators,
      result: null,
      isCorrect: false
    }));
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    if (!dailyGames || isLoading) return;

    const currentGame = dailyGames[getDifficultyKey(newDifficulty)];
    setGameState(prev => ({
      ...prev,
      difficulty: newDifficulty,
      numbers: currentGame.numbers,
      operators: [null, null, null, null],
      result: null,
      currentGameId: currentGame.math_game_id,
    }));
  };

  const confirmResult = async () => {
    if (gameState.operators.some(op => op === null) || isLoading) return;
    
    const { result } = calculateResult(gameState.numbers, gameState.operators as Operator[]);
    const isCorrect = dailyGames ? result === dailyGames[getDifficultyKey(gameState.difficulty)].result : false;
    
    if (gameState.currentGameId) {
      await saveGameAttempt(
        gameState.currentGameId,
        gameState.numbers,
        gameState.operators as string[],
        result
      );
    }
    
    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      setGameState(prev => ({
        ...prev,
        result,
        isCorrect: true,
        isIntegerResult: Number.isInteger(result),
      }));

      setTimeout(() => {
        if (dailyGames) {
          const currentGame = dailyGames[getDifficultyKey(gameState.difficulty)];
          setGameState(prev => ({
            ...prev,
            numbers: currentGame.numbers,
            operators: [null, null, null, null],
            result: null,
            previousAttempts: [],
            lives: 3,
            isCorrect: false,
            currentGameId: currentGame.math_game_id,
          }));
        }
      }, 2000);
    } else {
      const newLives = gameState.lives - 1;
      
      setGameState(prev => ({
        ...prev,
        result,
        isIntegerResult: Number.isInteger(result),
        isCorrect,
        previousAttempts: [...prev.previousAttempts, {
          numbers: prev.numbers,
          operators: prev.operators,
          result,
        }],
        lives: newLives,
        operators: [null, null, null, null],
        ...(newLives <= 0 && dailyGames && {
          operators: dailyGames[getDifficultyKey(gameState.difficulty)].operators as Operator[],
          result: dailyGames[getDifficultyKey(gameState.difficulty)].result,
          isCorrect: true
        })
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold">Mathe Spiel</h1>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Schwierigkeitsgrad</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((level) => (
            <button
              key={level}
              onClick={() => handleDifficultyChange(level as Difficulty)}
              disabled={isLoading}
              className={`px-4 py-2 rounded ${
                gameState.difficulty === level
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Level {level}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {getDifficultyDescription(gameState.difficulty)}
        </p>
      </div>

      <div className="mb-6 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          {gameState.numbers.map((num, i) => (
            <div key={i} className="flex items-center">
              <span className="text-2xl font-mono">{num}</span>
              {i < gameState.operators.length && (
                <div className="mx-2">
                  <button
                    onClick={() => handleOperatorClick(i, '+')}
                    disabled={isOperatorUsed('+') || gameState.lives <= 0 || isLoading}
                    className={`w-8 h-8 rounded ${
                      gameState.operators[i] === '+' 
                        ? 'bg-blue-500 text-white' 
                        : isOperatorUsed('+') || gameState.lives <= 0 || isLoading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleOperatorClick(i, '-')}
                    disabled={isOperatorUsed('-') || gameState.lives <= 0 || isLoading}
                    className={`w-8 h-8 rounded ${
                      gameState.operators[i] === '-' 
                        ? 'bg-blue-500 text-white' 
                        : isOperatorUsed('-') || gameState.lives <= 0 || isLoading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleOperatorClick(i, '*')}
                    disabled={isOperatorUsed('*') || gameState.lives <= 0 || isLoading}
                    className={`w-8 h-8 rounded ${
                      gameState.operators[i] === '*' 
                        ? 'bg-blue-500 text-white' 
                        : isOperatorUsed('*') || gameState.lives <= 0 || isLoading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    ×
                  </button>
                  <button
                    onClick={() => handleOperatorClick(i, '/')}
                    disabled={isOperatorUsed('/') || gameState.lives <= 0 || isLoading}
                    className={`w-8 h-8 rounded ${
                      gameState.operators[i] === '/' 
                        ? 'bg-blue-500 text-white' 
                        : isOperatorUsed('/') || gameState.lives <= 0 || isLoading
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
          <button
            onClick={confirmResult}
            disabled={gameState.operators.some(op => op === null) || gameState.lives <= 0 || isLoading}
            className={`ml-4 w-12 h-12 rounded-lg text-2xl font-bold ${
              gameState.operators.some(op => op === null) || gameState.lives <= 0 || isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            =
          </button>
        </div>

        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="text-sm font-semibold">Leben:</span>
          {[...Array(3)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 ${i < gameState.lives ? 'text-red-500' : 'text-gray-300'}`}
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
              <div className="p-4 bg-gray-100 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Lösung:</h2>
                <div className="flex items-center justify-center space-x-2">
                  {gameState.numbers.map((num, i) => (
                    <div key={i} className="flex items-center">
                      <span className="text-xl font-mono">{num}</span>
                      {i < gameState.operators.length && (
                        <span className="mx-2 text-xl">{gameState.operators[i]}</span>
                      )}
                    </div>
                  ))}
                  <span className="ml-4 text-xl font-bold">= {gameState.result}</span>
                </div>
              </div>
            ) : (
              <div className={`text-xl font-bold p-4 rounded-lg transition-colors duration-300 ${
                gameState.isCorrect 
                  ? 'bg-green-100 text-green-700' 
                  : !gameState.isIntegerResult 
                    ? 'text-red-500' 
                    : ''
              }`}>
                {gameState.isCorrect ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6 mr-2" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      <span>Richtig!</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-lg">
                      {gameState.numbers.map((num, i) => (
                        <div key={i} className="flex items-center">
                          <span className="font-mono">{num}</span>
                          {i < gameState.operators.length && (
                            <span className="mx-2">{gameState.operators[i]}</span>
                          )}
                        </div>
                      ))}
                      <span className="ml-2">= {gameState.result}</span>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {[...gameState.previousAttempts].reverse().map((attempt, index) => (
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
    </div>
  );
} 