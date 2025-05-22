'use client';

import { useState } from 'react';
import { Difficulty } from '../types/math';
import { generateTask, getDifficultyDescription } from '../lib/mathTasks';

interface GeneratedTask {
  id: number;
  numbers: number[];
  operators: string[];
  result: number;
  difficulty: Difficulty;
}

export default function TaskGenerator() {
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(1);
  const [generationCount, setGenerationCount] = useState(10);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTasks = async () => {
    setIsGenerating(true);
    setProgress(0);
    const newTasks: GeneratedTask[] = [];
    const startId = tasks.length + 1;
    // Hash-Set für schnelle Eindeutigkeitsprüfung
    const hashSet = new Set<string>(
      tasks.map(t => [
        t.numbers.join(','),
        t.operators.join(','),
        t.result,
        t.difficulty
      ].join('|'))
    );

    let consecutiveFails = 0;
    for (let i = 0; i < generationCount; i++) {
      if (consecutiveFails >= 200) {
        // Nur noch bestehende Aufgaben verwenden
        const allExisting = [...tasks, ...newTasks];
        if (allExisting.length > 0) {
          const randomTask = allExisting[Math.floor(Math.random() * allExisting.length)];
          newTasks.push({
            ...randomTask,
            id: startId + newTasks.length
          });
        }
        setProgress(Math.round(((i + 1) / generationCount) * 100));
        continue;
      }
      let unique = false;
      let tryCount = 0;
      let task: ReturnType<typeof generateTask> | undefined;
      let hash = '';
      while (!unique && tryCount < 100) {
        task = generateTask(currentDifficulty);
        hash = [
          task.numbers.join(','),
          task.operators.join(','),
          task.result,
          task.difficulty
        ].join('|');
        unique = !hashSet.has(hash);
        tryCount++;
      }
      if (unique && task) {
        const newTask: GeneratedTask = {
          id: startId + newTasks.length,
          numbers: task.numbers,
          operators: task.operators,
          result: task.result,
          difficulty: task.difficulty
        };
        newTasks.push(newTask);
        hashSet.add(hash);
        consecutiveFails = 0;
      } else {
        // Fallback: zufällige bestehende Aufgabe nehmen
        const allExisting = [...tasks, ...newTasks];
        if (allExisting.length > 0) {
          const randomTask = allExisting[Math.floor(Math.random() * allExisting.length)];
          newTasks.push({
            ...randomTask,
            id: startId + newTasks.length
          });
        }
        consecutiveFails++;
      }
      setProgress(Math.round(((i + 1) / generationCount) * 100));
      // Für große Mengen UI nicht blockieren:
      if ((i + 1) % 50 === 0) await new Promise(r => setTimeout(r, 0));
    }
    setTasks(prev => [...prev, ...newTasks]);
    setIsGenerating(false);
  };

  const mapDifficultyToString = (difficulty: Difficulty): string => {
    switch (difficulty) {
      case 1: return 'easy';
      case 2: return 'medium';
      case 3: return 'hard';
      case 4: return 'expert';
      default: return 'unknown';
    }
  };

  const exportToCsv = () => {
    // CSV Header
    const headers = ['id', 'numbers', 'operators', 'result', 'difficulty'];
    
    // CSV Rows
    const rows = tasks.map(task => [
      task.id,
      `"[${task.numbers.join(',')}]"`,
      `"[${task.operators.map(op => `""${op}""`).join(',')}]"`,
      task.result,
      mapDifficultyToString(task.difficulty)
    ]);

    // Combine header and rows with comma as separator
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `math-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mathe-Aufgaben Generator</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Einstellungen</h2>
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schwierigkeitsgrad
            </label>
            <select
              value={currentDifficulty}
              onChange={(e) => setCurrentDifficulty(Number(e.target.value) as Difficulty)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {[1, 2, 3, 4].map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {getDifficultyDescription(currentDifficulty)}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anzahl der Aufgaben
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={generationCount}
              onChange={(e) => setGenerationCount(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={generateTasks}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isGenerating}
        >
          Aufgaben generieren
        </button>
        <button
          onClick={exportToCsv}
          disabled={tasks.length === 0 || isGenerating}
          className={`px-4 py-2 rounded ${
            tasks.length === 0 || isGenerating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          Als CSV exportieren
        </button>
      </div>

      {isGenerating && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-sm text-gray-700">
            {progress}% abgeschlossen
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Generierte Aufgaben ({tasks.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  ID: {task.id} | Level {task.difficulty}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {task.numbers.map((num, i) => (
                  <div key={i} className="flex items-center">
                    <span className="text-lg font-mono">{num}</span>
                    {i < task.operators.length && (
                      <span className="mx-2 text-lg">{task.operators[i]}</span>
                    )}
                  </div>
                ))}
                <span className="ml-2 text-lg font-bold">= {task.result}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
