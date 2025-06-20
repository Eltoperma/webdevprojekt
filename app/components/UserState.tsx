"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabaseBrowserClient } from "@/app/lib/supabase/supabaseComponentClient";

export default function UserBadge() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user state
    const getUser = async () => {
      const { data: { user } } = await supabaseBrowserClient.auth.getUser();
      
      if (user) {
        const { data, error } = await supabaseBrowserClient
          .from("user_profile")
          .select("name")
          .eq("id", user.id)
          .single();
        
        if (!error && data?.name) {
          setUsername(data.name);
        }
      }
      setLoading(false);
    };

    getUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabaseBrowserClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data, error } = await supabaseBrowserClient
            .from("user_profile")
            .select("name")
            .eq("id", session.user.id)
            .single();
          
          if (!error && data?.name) {
            setUsername(data.name);
          }
        } else if (event === 'SIGNED_OUT') {
          setUsername(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Show loading state briefly
  if (loading) {
    return (
      <div className="absolute right-4 top-2 sm:top-5 sm:right-5 transform sm:translate-x-0 translate-x-1/2 sm:translate-y-0 z-40">
        <div className="group flex flex-col items-center p-2.5 rounded-xl bg-white/10 dark:bg-gray-900/20 backdrop-blur-md">
          <div className="sm:w-[52px] sm:h-[52px] w-[35px] h-[35px] bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="mt-1.5 w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-4 top-2 sm:top-5 sm:right-5 transform sm:translate-x-0 translate-x-1/2 sm:translate-y-0 z-40">
      {username ? (
        // User is logged in - show user badge
        <Link
          href="/dashboard"
          className="group flex flex-col items-center p-2.5 rounded-xl bg-white/10 dark:bg-gray-900/20 backdrop-blur-md hover:bg-white/15 dark:hover:bg-gray-900/30 transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <div className="sm:w-[52px] sm:h-[52px] w-[35px] h-[35px] rounded-full ring-2 ring-white/30 dark:ring-gray-600/30 group-hover:ring-white/50 dark:group-hover:ring-gray-500/50 transition-all duration-300 overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/70 flex items-center justify-center">
              <Image
                src="/astronaut.png"
                alt="Zum Dashboard"
                width={52}
                height={52}
                className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
          </div>
          <span className="mt-1.5 text-xs sm:text-sm font-semibold text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300">
            {username}
          </span>
        </Link>
      ) : (
        // User is not logged in - show login button
        <Link
          href="/login"
          className="group flex flex-col items-center p-2.5 rounded-xl bg-white/10 dark:bg-gray-900/20 backdrop-blur-md hover:bg-white/15 dark:hover:bg-gray-900/30 transition-all duration-300 hover:scale-105"
        >
          <div className="sm:w-[52px] sm:h-[52px] w-[35px] h-[35px] bg-gradient-to-br from-blue-400/80 to-purple-500/80 dark:from-blue-500/80 dark:to-purple-600/80 rounded-full flex items-center justify-center shadow-inner group-hover:from-blue-500/90 group-hover:to-purple-600/90 dark:group-hover:from-blue-600/90 dark:group-hover:to-purple-700/90 transition-all duration-300">
            <svg 
              className="sm:w-5 sm:h-5 w-3.5 h-3.5 text-white drop-shadow-sm" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
          </div>
          <span className="mt-1.5 text-xs sm:text-sm font-semibold text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300">
            Anmelden
          </span>
        </Link>
      )}
    </div>
  );
}
