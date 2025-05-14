"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/* Hier wird der Supabase-Auth-Client verwendet, um die Registrierung zu ermöglichen.
Außerdem wird unsere eigene Tabelle "user_profile" verwendet, um die Benutzerprofile parallel anzulegen.
 */
export default function RegisterPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, confirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    // Passwort-Check
    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Eigene Tabelle "user" aktualisieren
    //@todo eventuell auch über Prisma?
    const id = data.user?.id;
    if (id) {
      console.log("User ID:", id, "Name:", username);
      const { error: insertError } = await supabase
        .from("user_profile")
        .insert({
          id: id,
          name: username,
        });

      if (insertError) {
        setError(
          "Registrierung erfolgreich, aber Profildaten konnten nicht gespeichert werden."
        );
        console.error(insertError);
      }
    }

    setLoading(false);
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Registrieren</h1>

        <input
          type="name"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />

        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />

        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <input
          type="password"
          placeholder="Passwort wiederholen"
          value={passwordConfirm}
          onChange={(e) => confirmPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <button
          onClick={handleRegister}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? "Registriert..." : "Registrieren"}
        </button>

        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>
    </main>
  );
}
