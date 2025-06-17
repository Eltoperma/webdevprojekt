"use client";

import { useState, useTransition } from "react";

export default function SettingsForm({ user }: { user: any | null }) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState("");
  const [showEmailField, setShowEmailField] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <p className="text-red-500">
        Benutzerdaten konnten nicht geladen werden.
      </p>
    );
  }

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    const body: Record<string, string> = { name };
    if (showEmailField && email.trim() !== "") {
      body.email = email.trim();
    }

    const res = await fetch("/api/auth/update-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Fehler beim Speichern");
    } else {
      setSuccess(true);
      setEmail("");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    location.reload();
  };

  return (
    <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-xl space-y-6">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Einstellungen</h1>

        <div>
          <label className="block text-sm font-medium mb-1">Username:</label>
          <input
            className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {!showEmailField && (
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={() => setShowEmailField(true)}
          >
            E-Mail ändern
          </button>
        )}

        {showEmailField && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Neue E-Mail:
            </label>
            <input
              className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="neue@email.de"
            />
          </div>
        )}

        <div className="flex gap-4 mt-2">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={() => startTransition(handleSubmit)}
            disabled={isPending}
          >
            {isPending ? "Speichern..." : "Änderungen speichern"}
          </button>
        </div>

        {success && (
          <p className="text-green-500 text-sm">Änderungen gespeichert!</p>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {/* Dauerhaft sichtbarer Logout */}
      <div className="pt-4 border-t border-neutral-300 dark:border-neutral-700">
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          Abmelden
        </button>
      </div>
    </div>
  );
}
