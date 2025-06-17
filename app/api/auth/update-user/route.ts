import { NextResponse } from "next/server";
import { UserService } from "@/server/services/userService";
import "server-only";

export async function POST(req: Request) {
  const userService = new UserService();
  const result = await userService.updateUserProfile(req);

  if (!result) {
    return NextResponse.json({ error: result }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
