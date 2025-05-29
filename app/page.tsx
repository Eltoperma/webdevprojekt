import MathGame from './components/MathGame';
import TaskGenerator from './components/TaskGenerator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MathGame />
      {/* <TaskGenerator /> */}
    </main>
  );
}
