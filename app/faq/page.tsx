"use client";

import React from "react";

export default function FAQPage() {
  return (
    <main className="min-h-screen px-4 py-25 bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
      <div className="max-w-3xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-center">FAQ</h1>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            Wie melde ich mich ab?
          </h2>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Gehe auf die Landingpage</li>
            <li>Klicke auf „Zum Dashboard“</li>
            <li>Wähle Einstellung bearbeiten</li>
            <li>
              Im Fenster, welches sich geöffnet hat, ist unten links nun der
              Button zum abmelden
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            Wann kommen neue Spiele?
          </h2>
          <p>
            Leider ist das Projekt vorzeitig pausiert, da es in der Hand von
            unabhängigen Entwicklern liegt. Bleibt jedoch gespannt, wie sich das
            Space Game weiterentwickelt und welche neuen Spiele in das Game Hub
            kommen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            Kann ich selbst mit an dieser Website entwickeln?
          </h2>
          <p>
            Ja, melde dich gerne bei uns. Wir sind 24/7 unter folgender Nummer
            erreichbar:
            <span className="font-bold"> 110</span>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            Wurdet ihr schonmal gehacked?
          </h2>
          <p>
            Nein, natürlich nicht. Wir haben durch hohe Sicherheitsvorkehrungen
            die Website gegen alle Hacker geschützt. Eure Highscores sind also
            sicher vor Manipulation.
          </p>
        </section>
      </div>
    </main>
  );
}
