import Link from "next/link";
import { getUsername } from "@/server/services/userStateService";
import Image from "next/image";

import "server-only";

export default async function UserBadge() {
  const username = await getUsername();
  if (!username) return null;

  return (
    <div className="absolute right-4 top-2 sm:top-5 sm:right-5 transform sm:translate-x-0 translate-x-1/2 sm:translate-y-0 z-40">
      <Link
        href="/dashboard"
        className="flex flex-col items-center text-sm sm:text-base font-semibold dark:text-white"
      >
        <Image
          src="/astronaut.jpg"
          alt="Zum Dashboard"
          width={60}
          height={60}
          className="sm:w-[60px] sm:h-[60px] w-[40px] h-[40px]"
          priority
        />
        <span className="mt-1">{username}</span>
      </Link>
    </div>
  );
}
