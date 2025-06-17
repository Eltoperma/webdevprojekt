import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/supabaseServerClient";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { message: "Nicht authentifiziert" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { name, email } = body;

  // 1. Name in eigener Tabelle aktualisieren
  const { error: updateUserError } = await supabaseAdmin
    .from("user_profile")
    .update({ name })
    .eq("id", user.id);

  if (updateUserError) {
    return NextResponse.json(
      { message: updateUserError.message },
      { status: 500 }
    );
  }

  // 2. Email in Supabase Auth aktualisieren (optional)
  if (email?.trim()) {
    const { error: updateAuthError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email: email.trim(),
      });

    if (updateAuthError) {
      return NextResponse.json(
        { message: updateAuthError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
