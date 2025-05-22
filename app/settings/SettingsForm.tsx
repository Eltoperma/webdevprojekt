"use client";

import { useState } from "react";

export default function SettingsForm({ user }: { user: any | null }) {
  const [name, setName] = useState(user?.name ?? "");

  if (!user) {
    return (
      <p className="text-red-500">
        Benutzerdaten konnten nicht geladen werden.
      </p>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Einstellungen</h1>
      <p>Mitglied seit: {user.created_at?.slice(0, 10)}</p>

      <label className="block mt-4">Username:</label>
      <input
        className="border p-2 rounded w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  );
}
