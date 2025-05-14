"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@/types/user";

/* Hier wird der Supabase-Auth-Client verwendet, um die Anmeldung zu ermöglichen.
 */
export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    // 1. Hole User-Daten inkl. verknüpfter E-Mail
    const { data: profileData, error: profileError } = await supabase
      .from("user_profile")
      .select()
      .eq("name", name)
      .single();

    console.log("Profile Data:", profileData);

    if (profileError || !profileData?.auth_user?.email) {
      setError("Benutzername nicht gefunden oder fehlerhafte Zuordnung.");
      setLoading(false);
      return;
    }

    const email = profileData?.auth_user?.email;

    // 2. Login mit E-Mail und Passwort
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError("Login fehlgeschlagen: " + loginError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        <input
          type="name"
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
