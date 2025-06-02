'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Operator, Difficulty } from '../types/math';
import { MathGameHandler } from '../MathGame/MathGameHandler';

const ReactConfetti = dynamic(() => import('react-confetti'), {
  ssr: false
});

function getDifficultyDescription(difficulty: Difficulty): string {
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
export default function MathGame() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameHandler] = useState(() => new MathGameHandler());
  const [gameState, setGameState] = useState(gameHandler.getCurrentState());
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const initializeGame = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await gameHandler.initialize();
        setGameState(gameHandler.getCurrentState());
      } catch (err) {
        setError('Failed to load games. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, []);

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

  const handleOperatorClick = (index: number, operator: Operator) => {
    gameHandler.handleOperatorClick(index, operator);
    setGameState(gameHandler.getCurrentState());
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    gameHandler.handleDifficultyChange(newDifficulty);
    setGameState(gameHandler.getCurrentState());
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    gameHandler.handleKeyPress(event);
    setGameState(gameHandler.getCurrentState());
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const confirmResult = async () => {
    await gameHandler.confirmResult();
    setGameState(gameHandler.getCurrentState());
    if (gameState.gameState.isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  const handleContainerClick = () => {
    gameHandler.handleOperatorClick(-1, '+' as Operator); // Use -1 as index and any operator to just switch modes
    setGameState(gameHandler.getCurrentState());
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

  const { gameState: state, selectedOperatorIndex, isKeyboardMode } = gameState;

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto" onClick={handleContainerClick}>
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      
      
      <div className="mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-2 dark:text-white">Schwierigkeitsgrad</h2>
        <div className="grid grid-cols-2 sm:flex sm:gap-2 gap-1">
          {[1, 2, 3, 4].map((level) => (
            <button
              key={level}
              onClick={() => handleDifficultyChange(level as Difficulty)}
              disabled={isLoading}
              className={`px-2 sm:px-4 py-2 rounded relative min-w-0 sm:min-w-[100px] ${
                state.difficulty === level
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <span className="text-sm sm:text-base">Level {level}</span>
                {state.difficultyStates[level as Difficulty].isCompleted && (
                  state.difficultyStates[level as Difficulty].lives > 0 ? (
                    <Image 
                      src="/icons/check-circle.svg"
                      alt="Completed"
                      width={20}
                      height={20}
                      className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 absolute -right-1 -top-1" 
                    />
                  ) : (
                    <Image 
                      src="/icons/x-circle.svg"
                      alt="Failed"
                      width={20}
                      height={20}
                      className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 absolute -right-1 -top-1" 
                    />
                  )
                )}
              </div>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {getDifficultyDescription(state.difficulty)}
        </p>
      </div>

      <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex justify-end mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              gameHandler.resetOperators();
              setGameState(gameHandler.getCurrentState());
            }}
            disabled={!state.operators.some(op => op !== null) || state.difficultyStates[state.difficulty].lives <= 0 || isLoading || state.difficultyStates[state.difficulty].isCompleted}
            className={`p-1.5 rounded-full ${
              !state.operators.some(op => op !== null) || state.difficultyStates[state.difficulty].lives <= 0 || isLoading || state.difficultyStates[state.difficulty].isCompleted
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-300 cursor-not-allowed'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
            }`}
          >
            <Image 
              src="/icons/reset.svg"
              alt="Reset"
              width={20}
              height={20}
              className="h-4 w-4 sm:h-5 sm:w-5" 
            />
          </button>
        </div>
        <div className="flex items-center justify-center gap-0.5 sm:gap-2 overflow-x-auto">
          <div className="flex items-center flex-nowrap">
            {state.numbers.map((num, i) => (
              <div key={i} className="flex items-center flex-nowrap">
                <span className="text-base sm:text-2xl font-mono dark:text-white px-0.5 sm:px-1 whitespace-nowrap">{num}</span>
                {i < state.operators.length && (
                  <div className="mx-0.5 sm:mx-2 grid grid-cols-2 gap-0.5 sm:gap-1 flex-shrink-0 relative p-0.5 sm:p-1">
                    {selectedOperatorIndex === i && isKeyboardMode && (
                      <div className="absolute inset-0 border-2 border-blue-500 dark:border-blue-400 rounded-lg opacity-50" />
                    )}
                    <button
                      onClick={() => handleOperatorClick(i, '+')}
                      disabled={state.operators.includes('+') || state.difficultyStates[state.difficulty].lives <= 0 || isLoading || state.difficultyStates[state.difficulty].isCompleted}
                      className={`w-5 h-5 sm:w-8 sm:h-8 rounded text-sm sm:text-base ${
                        state.operators[i] === '+' 
                          ? 'bg-blue-500 text-white' 
                          : state.operators.includes('+') || state.difficultyStates[state.difficulty].lives <= 0 || isLoading || state.difficultyStates[state.difficulty].isCompleted
                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-300 cursor-not-allowed'
                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                      }`}
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleOperatorClick(i, '-')}
                      disabled={state.operators.includes('-') || state.difficultyStates[state.difficulty].lives <= 0 || isLoading || state.difficultyStates[state.difficulty].isCompleted}
                      className={`w-5 h-5 sm:w-8 sm:h-8 rounded text-sm sm:text-base ${
                        state.operators[i] === '-' 
                          ? 'bg-blue-500 text-white' 
                          : state.operators.includes('-') || state.difficultyStates[state.difficulty].lives <= 0 || isLoading || state.difficultyStates[state.difficulty].isCompleted
                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-300 cursor-not-allowed'
                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                      }`}
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleOperatorClick(i, '*')}
                      disabled={state.operators.includes('*') || state.difficultyStates[state.difficulty].lives <= 0 || isLoading || state.difficultyStates[state.difficulty].isCompleted}
                      className={`w-5 h-5 sm:w-8 sm:h-8 rounded text-sm sm:text-base ${
                        state.operators[i] === '*' 
                          ? 'bg-blue-500 text-white' 
                          : state.operators.includes('*') || state.difficultyStates[state.difficulty].lives <= 0 || isLoading || state.difficultyStates[state.difficulty].isCompleted
                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-300 cursor-not-allowed'
                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                      }`}
                    >
                      ×
                    </button>
                    <button
                      onClick={() => handleOperatorClick(i, '/')}
                      disabled={state.operators.includes('/') || state.difficultyStates[state.difficulty].lives <= 0 || isLoading || state.difficultyStates[state.difficulty].isCompleted}
                      className={`w-5 h-5 sm:w-8 sm:h-8 rounded text-sm sm:text-base ${
                        state.operators[i] === '/' 
                          ? 'bg-blue-500 text-white' 
                          : state.operators.includes('/') || state.difficultyStates[state.difficulty].lives <= 0 || isLoading || state.difficultyStates[state.difficulty].isCompleted
                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-300 cursor-not-allowed'
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
              disabled={state.operators.some(op => op === null) || state.difficultyStates[state.difficulty].lives <= 0 || isLoading || state.difficultyStates[state.difficulty].isCompleted}
              className={`ml-0.5 sm:ml-4 w-6 h-6 sm:w-12 sm:h-12 rounded-lg text-base sm:text-2xl font-bold flex-shrink-0 ${
                state.operators.some(op => op === null) || state.difficultyStates[state.difficulty].lives <= 0 || isLoading || state.difficultyStates[state.difficulty].isCompleted
                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              =
            </button>
          </div>
        </div>

        {(state.difficulty === 1 || state.difficulty === 2) && state.operators.some(op => op !== null) && (
          <div className="mt-2 text-center">
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Zwischenergebnis: {gameHandler.calculateIntermediateResult(state.numbers, state.operators)}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-center items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold dark:text-white">Leben:</span>
          {[...Array(3)].map((_, i) => (
            <Image
              key={i}
              src={i < state.difficultyStates[state.difficulty].lives ? "/icons/heart.svg" : "/icons/heart-gray.svg"}
              alt="Life"
              width={24}
              height={24}
              className="h-5 w-5 sm:h-6 sm:w-6"
            />
          ))}
        </div>

        {state.result !== null && (
          <div className="mt-4 text-center">
            {state.difficultyStates[state.difficulty].lives <= 0 ? (
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 dark:text-white">Lösung:</h2>
                <div className="flex items-center justify-center space-x-2">
                  {state.numbers.map((num, i) => (
                    <div key={i} className="flex items-center">
                      <span className="text-xl font-mono dark:text-white">{num}</span>
                      {i < state.operators.length && (
                        <span className="mx-2 text-xl dark:text-white">{state.operators[i]}</span>
                      )}
                    </div>
                  ))}
                  <span className="ml-4 text-xl font-bold dark:text-white">= {state.result}</span>
                </div>
              </div>
            ) : (
              <div className={`text-xl font-bold p-4 rounded-lg transition-colors duration-300 ${
                state.isCorrect 
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                  : !state.isIntegerResult 
                    ? 'text-red-500 dark:text-red-400' 
                    : 'dark:text-white'
              }`}>
                {state.isCorrect ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-2">
                      <Image 
                        src="/icons/check-circle.svg"
                        alt="Correct"
                        width={24}
                        height={24}
                        className="h-6 w-6 mr-2" 
                      />
                      <span>Richtig!</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-lg">
                      {state.numbers.map((num, i) => (
                        <div key={i} className="flex items-center">
                          <span className="font-mono">{num}</span>
                          {i < state.operators.length && (
                            <span className="mx-2">{state.operators[i]}</span>
                          )}
                        </div>
                      ))}
                      <span className="ml-2">= {state.result}</span>
                    </div>
                    <div className="mt-4 text-lg font-mono">
                      Final Score: {state.difficultyStates[state.difficulty].score}
                    </div>
                  </div>
                ) : (
                  <>
                    Ergebnis: {state.result}
                    {!state.isIntegerResult && (
                      <span className="ml-2 inline-flex items-center text-sm sm:text-base">
                        <Image 
                          src="/icons/info-circle.svg"
                          alt="Info"
                          width={20}
                          height={20}
                          className="h-4 w-4 sm:h-5 sm:w-5" 
                        />
                        <span className="ml-1">Das Ergebnis muss eine ganze Zahl sein!</span>
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {[...state.difficultyStates[state.difficulty].previousAttempts]
          .reverse()
          .map((attempt, index) => (
            <div key={index} className="mt-2 p-2 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg opacity-50">
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-base sm:text-lg">
                {attempt.numbers.map((num, i) => (
                  <div key={i} className="flex items-center">
                    <span className="font-mono dark:text-white">{num}</span>
                    {i < attempt.operators.length && (
                      <span className="mx-1 sm:mx-2 dark:text-white">{attempt.operators[i]}</span>
                    )}
                  </div>
                ))}
                <span className="ml-2 dark:text-white">= {attempt.result}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}