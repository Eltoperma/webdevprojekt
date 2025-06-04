"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowserClient } from "@/lib/supabase/supabaseComponentClient";

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
          className="dark:invert w-48 sm:w-60"
          src="/logo.png"
          alt="GameHub Logo"
          width={240}
          height={60}
          priority
        />

        {session ? (
          <p className="text-lg text-center sm:text-left">
            Willkommen zurück!{" "}
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
            :)
          </p>
        )}

        <div className="grid w-full gap-6 sm:grid-cols-2">
          {loading ? (
            <p className="text-center w-full">Lade Spiele …</p>
          ) : (
            games.map((game) => (
              <Link
                key={game.href}
                href={game.href}
                className="rounded-2xl border border-white/[.1] bg-white/[.02] p-8 hover:bg-white/[.05] transition-colors"
              >
                <h2 className="text-2xl font-semibold mb-2">{game.name}</h2>
                <p className="text-md text-gray-300">{game.description}</p>
              </Link>
            ))
          )}
        </div>

        <div className="flex gap-6 items-center flex-col sm:flex-row mt-10">
          <Link
            href="/about"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black gap-2 hover:bg-gray-300 font-medium text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-7 sm:w-auto"
          >
            Über das Projekt
          </Link>
          <Link
            href="/faq"
            className="rounded-full border border-solid border-white/[.15] transition-colors flex items-center justify-center hover:bg-white/[.05] font-medium text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-7 w-full sm:w-auto md:w-[180px]"
          >
            Häufige Fragen
          </Link>
        </div>
      </main>

      <footer className="mt-10 flex gap-6 flex-wrap items-center justify-center text-base text-black/80">
        <Link
          className="hover:underline hover:underline-offset-4"
          href="/impressum"
        >
          Impressum
        </Link>
        <Link
          className="hover:underline hover:underline-offset-4"
          href="/datenschutz"
        >
          Datenschutz
        </Link>
        <span>© {new Date().getFullYear()} GameHub Projekt</span>
      </footer>
    </div>
  );
}
