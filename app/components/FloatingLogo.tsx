import Link from "next/link";
import Image from "next/image";

export default function FloatingLogo() {
  return (
    <Link
      href="/"
      className="fixed top-4 left-4 z-50 opacity-50 hover:opacity-80 transition-opacity"
    >
      <Image
        src="/logo.png"
        alt="Zurück zur Startseite"
        width={60}
        height={60}
        priority
      />
    </Link>
  );
}
