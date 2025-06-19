"use client";

import { useState } from "react";
import SettingsForm from "../settings/SettingsForm";

type DashboardFormProps = {
  user: {
    name: string;
    created_at?: string;
  };
};

export default function DashboardForm({ user }: DashboardFormProps) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="max-w-3xl mx-auto p-6 m-20 bg-white dark:bg-neutral-900 rounded-2xl shadow-md space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-800 dark:text-neutral-100">
          Willkommen zurück, {user.name} 👋
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Mitglied seit: {user.created_at?.slice(0, 10) ?? "unbekannt"}
        </p>
      </div>

      <section className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-medium text-neutral-700 dark:text-neutral-200">
            ⚙️ Einstellungen
          </h2>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="ml-2 text-sm text-blue-600 hover:underline"
            >
              Bearbeiten
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <SettingsForm user={user} />

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-sm rounded dark:bg-blue-800 dark:hover:bg-blue-700 text-neutral-900 dark:text-white transition"
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <div className="text-neutral-500 text-sm italic">
            Bearbeite deine Profildaten hier. Klicke dafür auf
            &quot;Bearbeiten&quot;.
          </div>
        )}
      </section>
    </div>
  );
}
