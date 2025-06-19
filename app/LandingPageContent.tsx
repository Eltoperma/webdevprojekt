"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowserClient } from "@/app/lib/supabase/supabaseComponentClient";

type Game = {
  name: string;
  href: string;
  description: string;
};

type LandingPageContentProps = {
  session: any;
};

export default function LandingPageContent({
  session,
}: LandingPageContentProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      const supabase = supabaseBrowserClient;
      const { data, error } = await supabase
        .from("game")
        .select("name, href, description");

      if (error) {
        console.error("Fehler beim Laden der Spiele:", error);
      } else {
        setGames(data);
      }
      setLoading(false);
    };

    fetchGames();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full px-6 py-10 sm:px-12 sm:py-16 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-12 flex-1 items-center w-full max-w-6xl mx-auto">
        <Image
          className="w-48 sm:w-60"
          src="/logo.png"
          alt="GameHub Logo"
          width={240}
          height={60}
          priority
        />

        {session ? (
          <p className="text-lg text-center sm:text-left">
            Willkommen zurück! 🎮{" "}
            <Link className="underline" href="/dashboard">
              Zum Dashboard →
            </Link>
          </p>
        ) : (
          <p className="text-lg text-center sm:text-left">
            <Link className="underline" href="/login">
              Melde dich an
            </Link>{" "}
            oder{" "}
            <Link className="underline" href="/register">
              registriere dich
            </Link>
            🚀
          </p>
        )}

        <div className="grid w-full gap-6 sm:grid-cols-2">
          {loading ? (
            <p className="text-center w-full">Lade Spiele … ⚡</p>
          ) : (
            games.map((game) => (
              <Link
                key={game.href}
                href={game.href}
                className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-semibold mb-3 text-black dark:text-white drop-shadow-sm">
                    {game.name === "Math Game"
                      ? "🧮 "
                      : game.name === "Idle Space Game"
                      ? "🚀 "
                      : "🎮 "}
                    {game.name}
                  </h2>
                  <p className="text-md text-black/90 dark:text-white/90 leading-relaxed drop-shadow-sm">
                    {game.description}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="flex gap-6 items-center flex-col sm:flex-row mt-10">
          <Link
            href="/about"
            className="rounded-full border border-white/20 transition-all duration-300 flex items-center justify-center bg-white/10 backdrop-blur-md text-black dark:text-white gap-2 hover:bg-white/20 font-medium text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-7 sm:w-auto shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 group-hover:from-blue-500/30 group-hover:via-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300"></div>
            <span className="relative z-10">💡 Über das Projekt</span>
          </Link>
          <Link
            href="/faq"
            className="rounded-full border border-white/20 transition-all duration-300 flex items-center justify-center bg-white/10 backdrop-blur-md text-black dark:text-white gap-2 hover:bg-white/20 font-medium text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-7 sm:w-auto shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-teal-500/20 to-cyan-500/20 group-hover:from-green-500/30 group-hover:via-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300"></div>
            <span className="relative z-10">❓ Häufige Fragen</span>
          </Link>
        </div>
      </main>

      <footer className="mt-10 flex gap-6 flex-wrap items-center justify-center text-base text-black/80 dark:text-white/80">
        <Link
          className="hover:underline hover:underline-offset-4"
          href="/impressum"
        >
          📄 Impressum
        </Link>
        <Link
          className="hover:underline hover:underline-offset-4"
          href="/datenschutz"
        >
          🔒 Datenschutz
        </Link>
        <Link
          className="hover:underline hover:underline-offset-4 transition-opacity flex items-center gap-2"
          href="https://github.com/Eltoperma/webdevprojekt"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/icons/github.svg"
            alt="GitHub"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          GitHub
        </Link>
        <span>© {new Date().getFullYear()} GameHub Projekt 🎯</span>
      </footer>
    </div>
  );
}
