"use client";

type Props = {
  items: string[];
};

export default function Inventory({ items }: Props) {
  return (
    <div className="border p-4 rounded shadow">
      <h2 className="text-xl font-semibold">Inventar</h2>
      {items.length === 0 ? (
        <p>Kein Item gesammelt.</p>
      ) : (
        <ul className="list-disc pl-4">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
