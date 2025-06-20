"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/app/lib/supabase/supabaseComponentClient";

export default function RegisterForm() {
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

    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein.");
      setLoading(false);
      return;
    }

    try {
      if (username.length < 3) {
        setError("Der Benutzername muss mindestens 3 Zeichen lang sein.");
        setLoading(false);
        return;
      }
      if (username.length > 28) {
        setError("Der Benutzername darf maximal 28 Zeichen lang sein.");
        setLoading(false);
        return;
      }

      // überprüfen, ob der Benutzername bereits existiert
      const { data: preexistingUser } = await supabaseBrowserClient
        .from("user_profile")
        .select("id")
        .eq("name", username)
        .limit(1);

      if (preexistingUser && preexistingUser.length > 0) {
        setError("Der Benutzername ist bereits vergeben.");
        setLoading(false);
        return;
      }

      // Registrierung bei Supabase
      const { data, error: signUpError } =
        await supabaseBrowserClient.auth.signUp({
          email,
          password,
        });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Profil ergänzen
      const id = data.user?.id;
      if (id) {
        const { error: insertError } = await supabaseBrowserClient
          .from("user_profile")
          .insert({
            id,
            name: username,
          });

        if (insertError) {
          console.error(insertError);
          setError("Profildaten konnten nicht gespeichert werden.");
          return;
        }
      }

      router.push("/login");
    } catch (err) {
      setError("Ein Fehler ist aufgetreten: " + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-800 dark:text-white">
        <h1 className="text-2xl font-bold mb-4">Registrieren</h1>

        <input
          type="text"
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
