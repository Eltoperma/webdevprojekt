import { createSupabaseServerClient } from "@/app/lib/supabase/supabaseServerClient";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
