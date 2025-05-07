'use client';

import { useState, useEffect } from 'react';
import { generatePuzzle } from './puzzleData';
import ReactConfetti from 'react-confetti';

interface Door {
  id: number;
  statements: string[];
  isCorrect: boolean;
  color: string;
}

export default function LogicPuzzle() {
  const [doors, setDoors] = useState<Door[]>([]);
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Generiere ein neues Puzzle beim ersten Laden oder bei Schwierigkeitsänderung
  useEffect(() => {
    setDoors(generatePuzzle(difficulty));
    setSelectedDoor(null);
    setShowResult(false);
    setShowConfetti(false);
  }, [difficulty]);

  // Aktualisiere Fenstergröße für Konfetti
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

  const checkSolution = () => {
    if (selectedDoor === null) return;
    setShowResult(true);
    if (selectedDoor === doors.find(d => d.isCorrect)?.id) {
      setShowConfetti(true);
      // Stoppe Konfetti nach 5 Sekunden
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  const resetGame = () => {
    setDoors(generatePuzzle(difficulty));
    setSelectedDoor(null);
    setShowResult(false);
    setShowConfetti(false);
  };

  const getDoorColorClass = (color: string) => {
    switch (color) {
      case 'grün':
        return 'bg-green-500';
      case 'blau':
        return 'bg-blue-500';
      case 'gelb':
        return 'bg-yellow-400';
      default:
        return 'bg-gray-500';
    }
  };

  const getDifficultyDescription = (level: number) => {
    switch (level) {
      case 1:
        return "Einfach - Direkte Aussagen, 1-2 Aussagen pro Tür";
      case 2:
        return "Mittel - Leicht umformulierte Aussagen, 1-3 Aussagen pro Tür";
      case 3:
        return "Schwer - Komplexe Aussagen, 2-4 Aussagen pro Tür";
      case 4:
        return "Sehr schwer - Sehr komplexe Aussagen, 3-5 Aussagen pro Tür";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">Logikpuzzle: Die magischen Türen</h1>
        
        <div className="mb-8">
          <div className="flex justify-center items-center gap-4 mb-2">
            <label htmlFor="difficulty" className="text-lg font-semibold">Schwierigkeitsgrad:</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value={1}>Level 1 - Einfach</option>
              <option value={2}>Level 2 - Mittel</option>
              <option value={3}>Level 3 - Schwer</option>
              <option value={4}>Level 4 - Sehr schwer</option>
            </select>
          </div>
          <p className="text-center text-gray-600">{getDifficultyDescription(difficulty)}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {doors.map((door) => (
            <div
              key={door.id}
              className={`p-6 bg-white rounded-lg shadow-md cursor-pointer transition-all
                ${selectedDoor === door.id ? 'ring-4 ring-blue-500' : 'hover:shadow-lg'}`}
              onClick={() => setSelectedDoor(door.id)}
            >
              <div className={`w-full h-4 ${getDoorColorClass(door.color)} rounded-t-lg mb-4`} />
              <h2 className="text-xl font-semibold mb-4">Tür {door.id}</h2>
              <div className="space-y-2">
                {door.statements.map((statement, index) => (
                  <p key={index} className="text-gray-700">
                    {statement}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={checkSolution}
            disabled={selectedDoor === null}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            Lösung überprüfen
          </button>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Neues Puzzle
          </button>
        </div>

        {showResult && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Ergebnis:</h2>
            <p className="text-gray-700">
              {selectedDoor === doors.find(d => d.isCorrect)?.id
                ? "Glückwunsch! Du hast die richtige Tür gewählt!"
                : "Leider falsch! Versuche es noch einmal."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 