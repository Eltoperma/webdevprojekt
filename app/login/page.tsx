"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowserClient } from "@/app/lib/supabase/supabaseComponentClient";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState("/dashboard");

  useEffect(() => {
    const param = searchParams.get("redirect");
    if (param) setRedirect(param);
  }, [searchParams]);

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
        await supabaseBrowserClient.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        setError("Login fehlgeschlagen: " + loginError.message);
        return;
      }

      router.push(redirect);
    } catch (err) {
      setError("Netzwerkfehler: " + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md dark:bg-gray-800 dark:text-white">
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

        <div className="mt-4 text-center text-gray-600 bg-gray-50 dark:bg-gray-800">
          <p className="text-sm">
            Noch kein Konto?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Registrieren
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
