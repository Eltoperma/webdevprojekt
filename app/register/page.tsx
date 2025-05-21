"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseComponentClient } from "@/lib/supabase/supabaseComponentClient";

export default function RegisterPage() {
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
      const { data, error: signUpError } =
        await supabaseComponentClient.auth.signUp({
          email,
          password,
        });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const id = data.user?.id;
      if (id) {
        const { error: insertError } = await supabaseComponentClient
          .from("user_profile")
          .insert({
            id,
            name: username,
          });

        if (insertError) {
          console.error(insertError);
          setError(
            "Registrierung erfolgreich, aber Profildaten konnten nicht gespeichert werden."
          );
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
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
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
