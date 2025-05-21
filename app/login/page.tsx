"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseComponentClient } from "@/lib/supabase/supabaseComponentClient";

export default function LoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Hole E-Mail über geschützte API
      const res = await fetch("/api/auth/get-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const { email, error: emailError } = await res.json();

      if (!res.ok) {
        const message =
          res.status === 500
            ? "Serverfehler: " + emailError
            : "Ungültige Anmeldedaten.";
        setError(message);
        return;
      }

      const { error: loginError } =
        await supabaseComponentClient.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        setError("Login fehlgeschlagen: " + loginError.message);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Netzwerkfehler: " + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />

        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Einloggen..." : "Einloggen"}
        </button>

        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>
    </main>
  );
}
