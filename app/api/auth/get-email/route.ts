import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/server/services/userService";
import "server-only";

export async function POST(req: NextRequest) {
  const { name, password } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Name fehlt" }, { status: 400 });
  }

  const service = new UserService();
  const result = await service.getUserEmailByName(name, password);

  if (result.error || !result.email) {
    return NextResponse.json(
      { error: result.error || "Unbekannter Fehler" },
      { status: 404 }
    );
  }

  return NextResponse.json({ email: result.email });
}
