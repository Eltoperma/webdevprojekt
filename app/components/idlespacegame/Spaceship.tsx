"use client";

type Props = {
  position: number;
  onFly: () => void;
};

export default function Spaceship({ position, onFly }: Props) {
  return (
    <div className="border p-4 rounded shadow">
      <h2 className="text-xl font-semibold">Raumschiff</h2>
      <p>Aktuelle Position: {position}</p>
      <button
        onClick={onFly}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Weiterfliegen
      </button>
    </div>
  );
}
